import {
  ensureDatabase,
  findDoctor,
  findUserByEmail,
  getAppointment,
  insertAiMessage,
  insertAppointment,
  insertUser,
  listAiMessages,
  listAppointmentsFor,
  markAppointmentPaid,
  toPublicUser,
  updateAppointmentStatus,
  verifyPassword,
  type DbAppointment,
  type DbUser,
} from './db.js'
import { newId, signToken, userFromAuthHeader } from './session.js'

type Result = { status: number; body: Record<string, unknown> }

function missingDatabase(error: unknown): Result | null {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('DATABASE_URL')) {
    return { status: 503, body: { ok: false, message: 'Database is not configured. Set DATABASE_URL.' } }
  }
  return null
}

export async function loginWithPassword(email: string, password: string): Promise<Result> {
  try {
    await ensureDatabase()
    const row = await findUserByEmail(email)
    if (!row || !verifyPassword(password, row.password_hash)) {
      return { status: 401, body: { ok: false, message: 'Invalid email or password.' } }
    }
    const user = toPublicUser(row)
    return {
      status: 200,
      body: { ok: true, message: 'Welcome back.', token: signToken(user.id), user, role: user.role },
    }
  } catch (error) {
    return missingDatabase(error) ?? { status: 500, body: { ok: false, message: 'Could not sign in.' } }
  }
}

export async function registerAccount(input: {
  name?: string
  email?: string
  password?: string
  role?: string
}): Promise<Result> {
  const name = input.name?.trim() || ''
  const email = input.email?.trim().toLowerCase() || ''
  const password = input.password || ''
  const role = input.role
  if (!name || !email || !password) {
    return { status: 400, body: { ok: false, message: 'Name, email, and password are required.' } }
  }
  if (!role || !['patient', 'doctor', 'hospital'].includes(role)) {
    return { status: 400, body: { ok: false, message: 'Choose a valid role.' } }
  }
  try {
    await ensureDatabase()
    const existing = await findUserByEmail(email)
    if (existing) {
      return { status: 409, body: { ok: false, message: 'An account with this email already exists. Try logging in.' } }
    }
    const row = await insertUser({
      id: newId('u'),
      name,
      email,
      password,
      role: role as DbUser['role'],
    })
    if (!row) return { status: 500, body: { ok: false, message: 'Could not create the account.' } }
    const user = toPublicUser(row)
    return {
      status: 201,
      body: { ok: true, message: 'Account created.', token: signToken(user.id), user, role: user.role },
    }
  } catch (error) {
    return missingDatabase(error) ?? { status: 500, body: { ok: false, message: 'Could not create the account.' } }
  }
}

export async function currentSession(authHeader: string | undefined): Promise<Result> {
  try {
    const user = await userFromAuthHeader(authHeader)
    if (!user) return { status: 401, body: { ok: false, message: 'Sign in required.' } }
    return { status: 200, body: { ok: true, user } }
  } catch (error) {
    return missingDatabase(error) ?? { status: 500, body: { ok: false, message: 'Could not load the session.' } }
  }
}

export async function appointmentsFor(authHeader: string | undefined): Promise<Result> {
  try {
    const user = await userFromAuthHeader(authHeader)
    if (!user) return { status: 401, body: { ok: false, message: 'Sign in required.' } }
    const appointments = await listAppointmentsFor(user)
    return { status: 200, body: { ok: true, appointments } }
  } catch (error) {
    return missingDatabase(error) ?? { status: 500, body: { ok: false, message: 'Could not load appointments.' } }
  }
}

export async function bookAppointment(
  authHeader: string | undefined,
  input: { doctorId?: string; date?: string; time?: string; type?: string; notes?: string },
): Promise<Result> {
  try {
    const user = await userFromAuthHeader(authHeader)
    if (!user) return { status: 401, body: { ok: false, message: 'Please log in to book.' } }
    if (user.role !== 'patient') {
      return { status: 403, body: { ok: false, message: 'Only patients can book an appointment.' } }
    }
    const doctor = findDoctor(input.doctorId || '')
    if (!doctor) return { status: 404, body: { ok: false, message: 'Doctor not found.' } }
    if (!input.date || !input.time) {
      return { status: 400, body: { ok: false, message: 'Date and time are required.' } }
    }
    const type = input.type === 'in-person' ? 'in-person' : 'video'
    const created = await insertAppointment({
      id: newId('apt'),
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      patientName: user.name,
      patientUserId: user.id,
      date: input.date,
      time: input.time,
      status: 'pending',
      type,
      notes: input.notes?.trim() || null,
      amount: doctor.fee,
      paymentStatus: 'unpaid',
      paymentMethod: null,
      paidAt: null,
      receiptId: null,
    })
    return {
      status: 201,
      body: { ok: true, message: 'Appointment requested.', appointmentId: created.id, appointment: created },
    }
  } catch (error) {
    return missingDatabase(error) ?? { status: 500, body: { ok: false, message: 'Could not book the appointment.' } }
  }
}

function canManage(user: DbUser, appointment: DbAppointment) {
  if (user.role === 'admin' || user.role === 'hospital') return true
  if (user.role === 'doctor') {
    return appointment.doctorName === user.name || (user.id === 'd1' && appointment.doctorId === 'doc1')
  }
  return appointment.patientUserId === user.id || appointment.patientName.toLowerCase() === user.name.toLowerCase()
}

export async function changeAppointment(
  authHeader: string | undefined,
  id: string,
  input: { status?: DbAppointment['status']; paymentMethod?: DbAppointment['paymentMethod'] },
): Promise<Result> {
  try {
    const user = await userFromAuthHeader(authHeader)
    if (!user) return { status: 401, body: { ok: false, message: 'Sign in required.' } }
    const current = await getAppointment(id)
    if (!current || !canManage(user, current)) {
      return { status: 404, body: { ok: false, message: 'Appointment not found.' } }
    }

    if (input.paymentMethod) {
      if (user.role !== 'patient' && user.role !== 'admin' && user.role !== 'hospital') {
        return { status: 403, body: { ok: false, message: 'You cannot pay this appointment.' } }
      }
      if (current.paymentStatus === 'paid') {
        return { status: 409, body: { ok: false, message: 'Payment already completed or appointment missing.' } }
      }
      const receiptId = `RCP-${Date.now().toString().slice(-8)}`
      const paid = await markAppointmentPaid(id, input.paymentMethod, receiptId, new Date().toISOString())
      if (!paid) return { status: 409, body: { ok: false, message: 'Payment already completed or appointment missing.' } }
      return { status: 200, body: { ok: true, message: 'Payment received.', receiptId, appointment: paid } }
    }

    if (input.status) {
      if (user.role === 'patient') {
        return { status: 403, body: { ok: false, message: 'Patients cannot change appointment status.' } }
      }
      const updated = await updateAppointmentStatus(id, input.status)
      if (!updated) return { status: 404, body: { ok: false, message: 'Appointment not found.' } }
      return { status: 200, body: { ok: true, appointment: updated } }
    }

    return { status: 400, body: { ok: false, message: 'Nothing to update.' } }
  } catch (error) {
    return missingDatabase(error) ?? { status: 500, body: { ok: false, message: 'Could not update the appointment.' } }
  }
}

export async function rememberAiTurn(authHeader: string | undefined, userText: string, reply: string) {
  try {
    const user = await userFromAuthHeader(authHeader)
    if (!user || !userText.trim() || !reply.trim()) return
    await insertAiMessage(user.id, 'user', userText.slice(0, 4000))
    await insertAiMessage(user.id, 'assistant', reply.slice(0, 4000))
  } catch {
    // Chat still returns even if history cannot be saved.
  }
}

export async function aiHistory(authHeader: string | undefined): Promise<Result> {
  try {
    const user = await userFromAuthHeader(authHeader)
    if (!user) return { status: 401, body: { ok: false, messages: [] } }
    const rows = await listAiMessages(user.id)
    return {
      status: 200,
      body: {
        ok: true,
        messages: rows.map((row) => ({ role: row.role, content: row.content })),
      },
    }
  } catch (error) {
    return missingDatabase(error) ?? { status: 500, body: { ok: false, messages: [] } }
  }
}

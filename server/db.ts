import { randomBytes, scryptSync } from 'node:crypto'
import postgres from 'postgres'

export type DbUser = {
  id: string
  name: string
  email: string
  role: 'patient' | 'doctor' | 'hospital' | 'admin'
  phone: string | null
  specialty: string | null
  hospital: string | null
}

export type DbAppointment = {
  id: string
  doctorId: string
  doctorName: string
  specialty: string
  patientName: string
  patientUserId: string | null
  date: string
  time: string
  status: 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled'
  type: 'in-person' | 'video'
  notes: string | null
  amount: number
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: 'momo' | 'airtel' | 'card' | 'cash' | null
  paidAt: string | null
  receiptId: string | null
}

type UserRow = {
  id: string
  name: string
  email: string
  password_hash: string
  role: DbUser['role']
  phone: string | null
  specialty: string | null
  hospital: string | null
}

type AppointmentRow = {
  id: string
  doctor_id: string
  doctor_name: string
  specialty: string
  patient_name: string
  patient_user_id: string | null
  date: string
  time: string
  status: DbAppointment['status']
  type: DbAppointment['type']
  notes: string | null
  amount: number
  payment_status: DbAppointment['paymentStatus']
  payment_method: DbAppointment['paymentMethod']
  paid_at: string | null
  receipt_id: string | null
}

const doctors = [
  { id: 'doc1', name: 'Dr. Jean Mugabo', specialty: 'Cardiologist', fee: 25000 },
  { id: 'doc2', name: 'Dr. Marie Uwase', specialty: 'Pediatrician', fee: 20000 },
  { id: 'doc3', name: 'Dr. Eric Ndayishimiye', specialty: 'Neurologist', fee: 30000 },
  { id: 'doc4', name: 'Dr. Claire Mutesi', specialty: 'Dental', fee: 18000 },
  { id: 'doc5', name: 'Dr. Patrick Habimana', specialty: 'General practitioner', fee: 15000 },
  { id: 'doc6', name: 'Dr. Grace Ingabire', specialty: 'Gynecologist', fee: 28000 },
] as const

let sqlClient: ReturnType<typeof postgres> | null = null
let ready: Promise<void> | null = null

export function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || ''
}

export function getSql() {
  const url = databaseUrl()
  if (!url) throw new Error('DATABASE_URL is not set')
  if (!sqlClient) {
    const local = /localhost|127\.0\.0\.1/.test(url)
    sqlClient = postgres(url, {
      ssl: local ? false : 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
    })
  }
  return sqlClient
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const next = scryptSync(password, salt, 32)
  const prev = Buffer.from(hash, 'hex')
  return next.length === prev.length && timingSafeEqual(next, prev)
}

function timingSafeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a[i]! ^ b[i]!
  return diff === 0
}

export function toPublicUser(row: UserRow): DbUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone,
    specialty: row.specialty,
    hospital: row.hospital,
  }
}

export function toAppointment(row: AppointmentRow): DbAppointment {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    specialty: row.specialty,
    patientName: row.patient_name,
    patientUserId: row.patient_user_id,
    date: row.date,
    time: row.time,
    status: row.status,
    type: row.type,
    notes: row.notes,
    amount: Number(row.amount),
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    paidAt: row.paid_at,
    receiptId: row.receipt_id,
  }
}

export function findDoctor(id: string) {
  return doctors.find((doctor) => doctor.id === id) ?? null
}

export async function ensureDatabase() {
  if (!ready) ready = migrateAndSeed()
  await ready
}

async function migrateAndSeed() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      specialty TEXT,
      hospital TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      specialty TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      patient_user_id TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL,
      type TEXT NOT NULL,
      notes TEXT,
      amount INTEGER NOT NULL,
      payment_status TEXT NOT NULL,
      payment_method TEXT,
      paid_at TEXT,
      receipt_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS ai_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  const [{ count }] = await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM users`
  if (Number(count) > 0) return

  const demo = [
    {
      id: 'p1',
      name: 'Aline Mukamana',
      email: 'patient@ubuzimabwiza.com',
      password: 'patient123',
      role: 'patient',
      phone: '+250 788 100 200',
      specialty: null,
      hospital: null,
    },
    {
      id: 'd1',
      name: 'Dr. Jean Mugabo',
      email: 'doctor@ubuzimabwiza.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+250 788 300 400',
      specialty: 'Cardiologist',
      hospital: 'Kigali University Hospital',
    },
    {
      id: 'h1',
      name: 'CHUK Admin',
      email: 'hospital@ubuzimabwiza.com',
      password: 'hospital123',
      role: 'hospital',
      phone: '+250 788 500 600',
      specialty: null,
      hospital: 'CHUK',
    },
    {
      id: 'a1',
      name: 'Platform Admin',
      email: 'admin@ubuzimabwiza.com',
      password: 'admin123',
      role: 'admin',
      phone: null,
      specialty: null,
      hospital: null,
    },
  ]

  for (const user of demo) {
    await sql`
      INSERT INTO users (id, name, email, password_hash, role, phone, specialty, hospital)
      VALUES (
        ${user.id},
        ${user.name},
        ${user.email},
        ${hashPassword(user.password)},
        ${user.role},
        ${user.phone},
        ${user.specialty},
        ${user.hospital}
      )
      ON CONFLICT (email) DO NOTHING
    `
  }

  const seeded = [
    ['apt1', 'doc1', 'Dr. Jean Mugabo', 'Cardiologist', 'Aline Mukamana', 'p1', '2026-07-24', '10:00', 'approved', 'video', 'Follow-up for blood pressure review', 25000, 'unpaid', null, null, null],
    ['apt2', 'doc2', 'Dr. Marie Uwase', 'Pediatrician', 'Aline Mukamana', 'p1', '2026-07-28', '14:30', 'pending', 'in-person', null, 20000, 'unpaid', null, null, null],
    ['apt3', 'doc1', 'Dr. Jean Mugabo', 'Cardiologist', 'Claudine Niyonzima', null, '2026-07-23', '09:00', 'pending', 'video', null, 25000, 'paid', 'momo', '2026-07-22T10:15:00', 'RCP-1003'],
  ] as const

  for (const row of seeded) {
    await sql`
      INSERT INTO appointments (
        id, doctor_id, doctor_name, specialty, patient_name, patient_user_id,
        date, time, status, type, notes, amount, payment_status, payment_method, paid_at, receipt_id
      ) VALUES (
        ${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]},
        ${row[6]}, ${row[7]}, ${row[8]}, ${row[9]}, ${row[10]}, ${row[11]},
        ${row[12]}, ${row[13]}, ${row[14]}, ${row[15]}
      )
      ON CONFLICT (id) DO NOTHING
    `
  }
}

export async function findUserByEmail(email: string) {
  const sql = getSql()
  const rows = await sql<UserRow[]>`SELECT * FROM users WHERE lower(email) = ${email.trim().toLowerCase()} LIMIT 1`
  return rows[0] ?? null
}

export async function findUserById(id: string) {
  const sql = getSql()
  const rows = await sql<UserRow[]>`SELECT * FROM users WHERE id = ${id} LIMIT 1`
  return rows[0] ?? null
}

export async function insertUser(input: {
  id: string
  name: string
  email: string
  password: string
  role: DbUser['role']
}) {
  const sql = getSql()
  const rows = await sql<UserRow[]>`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (${input.id}, ${input.name}, ${input.email}, ${hashPassword(input.password)}, ${input.role})
    RETURNING *
  `
  return rows[0]
}

export async function listAppointmentsFor(user: DbUser) {
  const sql = getSql()
  const rows =
    user.role === 'patient'
      ? await sql<AppointmentRow[]>`
          SELECT * FROM appointments
          WHERE patient_user_id = ${user.id} OR lower(patient_name) = ${user.name.toLowerCase()}
          ORDER BY date DESC, time DESC
        `
      : user.role === 'doctor'
        ? await sql<AppointmentRow[]>`
            SELECT * FROM appointments
            WHERE doctor_name = ${user.name}
               OR (${user.id} = 'd1' AND doctor_id = 'doc1')
            ORDER BY date DESC, time DESC
          `
        : await sql<AppointmentRow[]>`SELECT * FROM appointments ORDER BY date DESC, time DESC`
  return rows.map(toAppointment)
}

export async function insertAppointment(row: DbAppointment) {
  const sql = getSql()
  const rows = await sql<AppointmentRow[]>`
    INSERT INTO appointments (
      id, doctor_id, doctor_name, specialty, patient_name, patient_user_id,
      date, time, status, type, notes, amount, payment_status
    ) VALUES (
      ${row.id}, ${row.doctorId}, ${row.doctorName}, ${row.specialty}, ${row.patientName}, ${row.patientUserId},
      ${row.date}, ${row.time}, ${row.status}, ${row.type}, ${row.notes}, ${row.amount}, ${row.paymentStatus}
    )
    RETURNING *
  `
  return toAppointment(rows[0]!)
}

export async function getAppointment(id: string) {
  const sql = getSql()
  const rows = await sql<AppointmentRow[]>`SELECT * FROM appointments WHERE id = ${id} LIMIT 1`
  return rows[0] ? toAppointment(rows[0]) : null
}

export async function updateAppointmentStatus(id: string, status: DbAppointment['status']) {
  const sql = getSql()
  const rows = await sql<AppointmentRow[]>`
    UPDATE appointments SET status = ${status} WHERE id = ${id} RETURNING *
  `
  return rows[0] ? toAppointment(rows[0]) : null
}

export async function markAppointmentPaid(id: string, method: NonNullable<DbAppointment['paymentMethod']>, receiptId: string, paidAt: string) {
  const sql = getSql()
  const rows = await sql<AppointmentRow[]>`
    UPDATE appointments
    SET payment_status = 'paid',
        payment_method = ${method},
        paid_at = ${paidAt},
        receipt_id = ${receiptId},
        status = CASE WHEN status = 'pending' THEN 'approved' ELSE status END
    WHERE id = ${id} AND payment_status <> 'paid'
    RETURNING *
  `
  return rows[0] ? toAppointment(rows[0]) : null
}

export async function insertAiMessage(userId: string | null, role: string, content: string) {
  const sql = getSql()
  const id = `ai_${randomBytes(8).toString('hex')}`
  await sql`
    INSERT INTO ai_messages (id, user_id, role, content)
    VALUES (${id}, ${userId}, ${role}, ${content})
  `
}

export async function listAiMessages(userId: string) {
  const sql = getSql()
  return sql<{ role: string; content: string; created_at: Date }[]>`
    SELECT role, content, created_at FROM ai_messages
    WHERE user_id = ${userId}
    ORDER BY created_at ASC
    LIMIT 40
  `
}

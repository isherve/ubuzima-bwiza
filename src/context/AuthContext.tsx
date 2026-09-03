import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  dashboardPath,
  demoUsers,
  doctors,
  initialAppointments,
  type Appointment,
  type PaymentMethod,
  type Role,
  type User,
} from '../data'
import i18n from '../i18n'

type AuthContextValue = {
  user: User | null
  appointments: Appointment[]
  login: (email: string, password: string) => { ok: boolean; message: string; role?: Role }
  register: (input: {
    name: string
    email: string
    password: string
    role: Role
  }) => { ok: boolean; message: string }
  logout: () => void
  bookAppointment: (input: {
    doctorId: string
    date: string
    time: string
    type: 'in-person' | 'video'
    notes?: string
  }) => { ok: boolean; message: string; appointmentId?: string }
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void
  payAppointment: (
    id: string,
    method: PaymentMethod,
  ) => { ok: boolean; message: string; receiptId?: string }
}

const AuthContext = createContext<AuthContextValue | null>(null)
const USER_KEY = 'ub_user'
const APT_KEY = 'ub_appointments'

function normalizeAppointment(raw: Partial<Appointment> & { id: string }): Appointment {
  const doctor = doctors.find((d) => d.id === raw.doctorId || d.name === raw.doctorName)
  return {
    id: raw.id,
    doctorId: raw.doctorId ?? doctor?.id ?? 'doc1',
    doctorName: raw.doctorName ?? doctor?.name ?? 'Doctor',
    specialty: raw.specialty ?? doctor?.specialty ?? 'General practitioner',
    patientName: raw.patientName ?? 'Patient',
    date: raw.date ?? '',
    time: raw.time ?? '',
    status: raw.status ?? 'pending',
    type: raw.type ?? 'video',
    notes: raw.notes,
    amount: raw.amount ?? doctor?.fee ?? 15000,
    paymentStatus: raw.paymentStatus ?? 'unpaid',
    paymentMethod: raw.paymentMethod,
    paidAt: raw.paidAt,
    receiptId: raw.receiptId,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY) ?? localStorage.getItem('ohl_user')
    return raw ? (JSON.parse(raw) as User) : null
  })
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const raw = localStorage.getItem(APT_KEY) ?? localStorage.getItem('ohl_appointments')
    if (!raw) return initialAppointments
    try {
      const parsed = JSON.parse(raw) as Appointment[]
      return parsed.map((a) => normalizeAppointment(a))
    } catch {
      return initialAppointments
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [user])

  useEffect(() => {
    localStorage.setItem(APT_KEY, JSON.stringify(appointments))
  }, [appointments])

  const login = useCallback((email: string, password: string) => {
    const found = demoUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    )
    if (!found) return { ok: false, message: i18n.t('auth.invalidCredentials') }
    const { password: _pw, ...safe } = found
    setUser(safe)
    return { ok: true, message: i18n.t('auth.loginSuccess'), role: safe.role }
  }, [])

  const register = useCallback(
    (input: { name: string; email: string; password: string; role: Role }) => {
      if (demoUsers.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
        return { ok: false, message: 'An account with this email already exists. Try logging in.' }
      }
      const next: User = {
        id: `u_${Date.now()}`,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
      }
      demoUsers.push({ ...next, password: input.password })
      setUser(next)
      return { ok: true, message: 'Account created.' }
    },
    [],
  )

  const logout = useCallback(() => setUser(null), [])

  const bookAppointment = useCallback(
    (input: {
      doctorId: string
      date: string
      time: string
      type: 'in-person' | 'video'
      notes?: string
    }) => {
      if (!user) return { ok: false, message: i18n.t('auth.pleaseLogin') }
      const doctor = doctors.find((d) => d.id === input.doctorId)
      if (!doctor) return { ok: false, message: 'Doctor not found.' }
      const apt: Appointment = {
        id: `apt_${Date.now()}`,
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        patientName: user.name,
        date: input.date,
        time: input.time,
        status: 'pending',
        type: input.type,
        notes: input.notes,
        amount: doctor.fee,
        paymentStatus: 'unpaid',
      }
      setAppointments((prev) => [apt, ...prev])
      return {
        ok: true,
        message: i18n.t('auth.appointmentRequested'),
        appointmentId: apt.id,
      }
    },
    [user],
  )

  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }, [])

  const payAppointment = useCallback((id: string, method: PaymentMethod) => {
    let receiptId = ''
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        if (a.paymentStatus === 'paid') return a
        receiptId = `RCP-${Date.now().toString().slice(-8)}`
        return {
          ...a,
          paymentStatus: 'paid',
          paymentMethod: method,
          paidAt: new Date().toISOString(),
          receiptId,
          status: a.status === 'pending' ? 'approved' : a.status,
        }
      }),
    )
    if (!receiptId) return { ok: false, message: 'Payment already completed or appointment missing.' }
    return { ok: true, message: i18n.t('auth.paymentSuccess'), receiptId }
  }, [])

  const value = useMemo(
    () => ({
      user,
      appointments,
      login,
      register,
      logout,
      bookAppointment,
      updateAppointmentStatus,
      payAppointment,
    }),
    [
      user,
      appointments,
      login,
      register,
      logout,
      bookAppointment,
      updateAppointmentStatus,
      payAppointment,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { dashboardPath }

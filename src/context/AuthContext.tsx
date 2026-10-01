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
  type Appointment,
  type PaymentMethod,
  type Role,
  type User,
} from '../data'
import { apiRequest, authToken, setAuthToken } from '../lib/session'

type AuthResult = { ok: boolean; message: string; role?: Role }

type AuthContextValue = {
  ready: boolean
  user: User | null
  appointments: Appointment[]
  login: (email: string, password: string) => Promise<AuthResult>
  register: (input: { name: string; email: string; password: string; role: Role }) => Promise<AuthResult>
  logout: () => void
  bookAppointment: (input: {
    doctorId: string
    date: string
    time: string
    type: 'in-person' | 'video'
    notes?: string
  }) => Promise<{ ok: boolean; message: string; appointmentId?: string }>
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void
  payAppointment: (id: string, method: PaymentMethod) => Promise<{ ok: boolean; message: string; receiptId?: string }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function asUser(raw: User & { phone?: string | null; specialty?: string | null; hospital?: string | null }): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    phone: raw.phone || undefined,
    specialty: raw.specialty || undefined,
    hospital: raw.hospital || undefined,
  }
}

function asAppointment(raw: Appointment & { notes?: string | null }): Appointment {
  return { ...raw, notes: raw.notes || undefined, paymentMethod: raw.paymentMethod || undefined, paidAt: raw.paidAt || undefined, receiptId: raw.receiptId || undefined }
}

async function loadAppointments() {
  const result = await apiRequest<{ appointments?: Appointment[] }>('/api/appointments')
  return (result.data.appointments ?? []).map(asAppointment)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const token = authToken()
    if (!token) {
      setReady(true)
      return
    }
    void apiRequest<{ user?: User }>('/api/auth/session')
      .then(async (result) => {
        if (!result.ok || !result.data.user) {
          setAuthToken(null)
          return
        }
        setUser(asUser(result.data.user))
        setAppointments(await loadAppointments())
      })
      .finally(() => setReady(true))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ ok?: boolean; message?: string; token?: string; user?: User; role?: Role }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    )
    if (!result.ok || !result.data.token || !result.data.user) {
      return { ok: false, message: result.data.message || 'Invalid email or password.' }
    }
    setAuthToken(result.data.token)
    setUser(asUser(result.data.user))
    setAppointments(await loadAppointments())
    return { ok: true, message: result.data.message || 'Welcome back.', role: result.data.user.role }
  }, [])

  const register = useCallback(async (input: { name: string; email: string; password: string; role: Role }) => {
    const result = await apiRequest<{ ok?: boolean; message?: string; token?: string; user?: User }>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify(input) },
    )
    if (!result.ok || !result.data.token || !result.data.user) {
      return { ok: false, message: result.data.message || 'Could not create the account.' }
    }
    setAuthToken(result.data.token)
    setUser(asUser(result.data.user))
    setAppointments([])
    return { ok: true, message: result.data.message || 'Account created.', role: result.data.user.role }
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    setUser(null)
    setAppointments([])
  }, [])

  const bookAppointment = useCallback(
    async (input: { doctorId: string; date: string; time: string; type: 'in-person' | 'video'; notes?: string }) => {
      const result = await apiRequest<{ ok?: boolean; message?: string; appointmentId?: string }>(
        '/api/appointments',
        { method: 'POST', body: JSON.stringify(input) },
      )
      if (!result.ok) return { ok: false, message: result.data.message || 'Could not book the appointment.' }
      setAppointments(await loadAppointments())
      return {
        ok: true,
        message: result.data.message || 'Appointment requested.',
        appointmentId: result.data.appointmentId,
      }
    },
    [],
  )

  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
    void apiRequest<{ appointment?: Appointment }>(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).then(async (result) => {
      if (result.ok) setAppointments(await loadAppointments())
    })
  }, [])

  const payAppointment = useCallback(async (id: string, method: PaymentMethod) => {
    const result = await apiRequest<{ ok?: boolean; message?: string; receiptId?: string }>(
      `/api/appointments/${id}`,
      { method: 'PATCH', body: JSON.stringify({ paymentMethod: method }) },
    )
    if (!result.ok) {
      return { ok: false, message: result.data.message || 'Payment already completed or appointment missing.' }
    }
    setAppointments(await loadAppointments())
    return { ok: true, message: result.data.message || 'Payment received.', receiptId: result.data.receiptId }
  }, [])

  const value = useMemo(
    () => ({
      ready,
      user,
      appointments,
      login,
      register,
      logout,
      bookAppointment,
      updateAppointmentStatus,
      payAppointment,
    }),
    [ready, user, appointments, login, register, logout, bookAppointment, updateAppointmentStatus, payAppointment],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { dashboardPath }

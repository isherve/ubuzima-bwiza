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
  type Role,
  type User,
} from '../data'

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
  }) => { ok: boolean; message: string }
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const USER_KEY = 'ohl_user'
const APT_KEY = 'ohl_appointments'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  })
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const raw = localStorage.getItem(APT_KEY)
    return raw ? (JSON.parse(raw) as Appointment[]) : initialAppointments
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
    if (!found) return { ok: false, message: 'Invalid email or password.' }
    const { password: _pw, ...safe } = found
    setUser(safe)
    return { ok: true, message: 'Login successful.', role: safe.role }
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
      if (!user) return { ok: false, message: 'Please log in first.' }
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
      }
      setAppointments((prev) => [apt, ...prev])
      return { ok: true, message: 'Appointment requested successfully.' }
    },
    [user],
  )

  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
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
    }),
    [user, appointments, login, register, logout, bookAppointment, updateAppointmentStatus],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { dashboardPath }

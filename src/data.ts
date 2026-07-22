export type Role = 'patient' | 'doctor' | 'hospital' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: Role
  phone?: string
  specialty?: string
  hospital?: string
}

export type Doctor = {
  id: string
  name: string
  specialty: string
  hospital: string
  rating: number
  reviews: number
  available: boolean
  fee: number
  initials: string
  bio: string
}

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'momo' | 'airtel' | 'card' | 'cash'

export type Appointment = {
  id: string
  doctorId: string
  doctorName: string
  specialty: string
  patientName: string
  date: string
  time: string
  status: 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled'
  type: 'in-person' | 'video'
  notes?: string
  amount: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paidAt?: string
  receiptId?: string
}

export const specialties = [
  'General practitioner',
  'Gynecologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Internist',
  'Dental',
  'Orthopedic surgeon',
  'Cardiologist',
  'Ophthalmologist',
  'ENT surgeon',
  'Endocrinologist',
] as const

export const demoUsers: Array<User & { password: string }> = [
  {
    id: 'p1',
    name: 'Aline Mukamana',
    email: 'patient@ubuzimabwiza.com',
    password: 'patient123',
    role: 'patient',
    phone: '+250 788 100 200',
  },
  {
    id: 'd1',
    name: 'Dr. Jean Mugabo',
    email: 'doctor@ubuzimabwiza.com',
    password: 'doctor123',
    role: 'doctor',
    specialty: 'Cardiologist',
    hospital: 'Kigali University Hospital',
    phone: '+250 788 300 400',
  },
  {
    id: 'h1',
    name: 'CHUK Admin',
    email: 'hospital@ubuzimabwiza.com',
    password: 'hospital123',
    role: 'hospital',
    hospital: 'CHUK',
    phone: '+250 788 500 600',
  },
  {
    id: 'a1',
    name: 'Platform Admin',
    email: 'admin@ubuzimabwiza.com',
    password: 'admin123',
    role: 'admin',
  },
]

export const doctors: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Jean Mugabo',
    specialty: 'Cardiologist',
    hospital: 'Kigali University Hospital',
    rating: 4.9,
    reviews: 120,
    available: true,
    fee: 25000,
    initials: 'JM',
    bio: 'Senior cardiologist specializing in hypertension and heart disease management.',
  },
  {
    id: 'doc2',
    name: 'Dr. Marie Uwase',
    specialty: 'Pediatrician',
    hospital: 'Rwanda Children’s Hospital',
    rating: 4.9,
    reviews: 98,
    available: true,
    fee: 20000,
    initials: 'MU',
    bio: 'Child health specialist with 12 years of experience across Rwanda.',
  },
  {
    id: 'doc3',
    name: 'Dr. Eric Ndayishimiye',
    specialty: 'Neurologist',
    hospital: 'CHUK',
    rating: 4.8,
    reviews: 86,
    available: false,
    fee: 30000,
    initials: 'EN',
    bio: 'Neurology consultant focused on stroke care and chronic neurological conditions.',
  },
  {
    id: 'doc4',
    name: 'Dr. Claire Mutesi',
    specialty: 'Dental',
    hospital: 'Gakwerere Dental Clinic',
    rating: 4.9,
    reviews: 74,
    available: true,
    fee: 18000,
    initials: 'CM',
    bio: 'Preventive and restorative dentistry for families.',
  },
  {
    id: 'doc5',
    name: 'Dr. Patrick Habimana',
    specialty: 'General practitioner',
    hospital: 'Ubuzima Bwiza Network',
    rating: 4.7,
    reviews: 140,
    available: true,
    fee: 15000,
    initials: 'PH',
    bio: 'Primary care for routine check-ups, triage, and family medicine.',
  },
  {
    id: 'doc6',
    name: 'Dr. Grace Ingabire',
    specialty: 'Gynecologist',
    hospital: 'King Faisal Hospital',
    rating: 4.8,
    reviews: 110,
    available: true,
    fee: 28000,
    initials: 'GI',
    bio: 'Women’s health, antenatal care, and reproductive medicine.',
  },
]

export const initialAppointments: Appointment[] = [
  {
    id: 'apt1',
    doctorId: 'doc1',
    doctorName: 'Dr. Jean Mugabo',
    specialty: 'Cardiologist',
    patientName: 'Aline Mukamana',
    date: '2026-07-24',
    time: '10:00',
    status: 'approved',
    type: 'video',
    notes: 'Follow-up for blood pressure review',
    amount: 25000,
    paymentStatus: 'unpaid',
  },
  {
    id: 'apt2',
    doctorId: 'doc2',
    doctorName: 'Dr. Marie Uwase',
    specialty: 'Pediatrician',
    patientName: 'Aline Mukamana',
    date: '2026-07-28',
    time: '14:30',
    status: 'pending',
    type: 'in-person',
    amount: 20000,
    paymentStatus: 'unpaid',
  },
  {
    id: 'apt3',
    doctorId: 'doc1',
    doctorName: 'Dr. Jean Mugabo',
    specialty: 'Cardiologist',
    patientName: 'Claudine Niyonzima',
    date: '2026-07-23',
    time: '09:00',
    status: 'pending',
    type: 'video',
    amount: 25000,
    paymentStatus: 'paid',
    paymentMethod: 'momo',
    paidAt: '2026-07-22T10:15:00',
    receiptId: 'RCP-1003',
  },
]

export const medications = [
  { id: 'm1', name: 'Amlodipine 5mg', dose: '1 tablet daily', remaining: '18 days' },
  { id: 'm2', name: 'Metformin 500mg', dose: '1 tablet twice daily', remaining: '12 days' },
]

export const records = [
  { id: 'r1', title: 'Blood pressure check', date: '2026-07-10', doctor: 'Dr. Jean Mugabo' },
  { id: 'r2', title: 'Pediatric consultation', date: '2026-06-22', doctor: 'Dr. Marie Uwase' },
  { id: 'r3', title: 'Lab results — lipid panel', date: '2026-06-02', doctor: 'CHUK Lab' },
]

export const messages = [
  {
    id: 'msg1',
    from: 'Dr. Jean Mugabo',
    preview: 'Please share your morning BP readings before Friday.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'msg2',
    from: 'Ubuzima Bwiza Support',
    preview: 'Your appointment confirmation is ready.',
    time: '2 days ago',
    unread: false,
  },
]

export function dashboardPath(role: Role) {
  switch (role) {
    case 'doctor':
      return '/doctor-dashboard'
    case 'hospital':
      return '/hospital-dashboard'
    case 'admin':
      return '/admin-dashboard'
    default:
      return '/my-appointments'
  }
}

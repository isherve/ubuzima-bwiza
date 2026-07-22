import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Footer, Navbar } from './components/Layout'
import { DashboardShell, RequireAuth } from './components/dashboard/Shell'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { BookAppointmentPage, DoctorProfilePage, DoctorsPage } from './pages/DoctorsPage'
import { HomePage } from './pages/HomePage'
import { AboutPage, ContactPage, LegalPage } from './pages/marketing/StaticPages'
import { PublicAiPage } from './pages/PublicAiPage'
import {
  ChronicCareApplyPage,
  ChronicCarePage,
  MedicalRecordPage,
  MedicationsPage,
  MessagesPage,
  PatientAppointmentsPage,
  ProfilePage,
} from './pages/patient/PatientPages'
import {
  DoctorAppointmentsPage,
  DoctorAvailabilityPage,
  DoctorCalendarPage,
  DoctorDashboardPage,
  DoctorPatientsPage,
  DoctorProfilePageDash,
} from './pages/doctor/DoctorPages'
import {
  AdminDashboardPage,
  AllAppointmentsPage,
  AnnouncementsPage,
  ApprovalsPage,
  HospitalAppointmentsPage,
  HospitalDashboardPage,
  HospitalDoctorsPage,
  HospitalPatientsPage,
  HospitalReportsPage,
  HospitalSettingsPage,
  ManageUsersPage,
  SettingsPage,
} from './pages/hospital/OpsPages'
import { PayAppointmentPage, PaymentsPage } from './pages/PaymentsPage'

function MarketingLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<HomePage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="doctors/:id" element={<DoctorProfilePage />} />
        <Route path="book/:id" element={<BookAppointmentPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route
          path="privacy-policy"
          element={
            <LegalPage
              title="Privacy Policy"
              body="We protect patient data with encryption and role-based access across Ubuzima Bwiza."
            />
          }
        />
        <Route
          path="terms-of-service"
          element={
            <LegalPage
              title="Terms of Service"
              body="By using Ubuzima Bwiza you agree to responsible use of telemedicine and appointment services."
            />
          }
        />
        <Route path="patient/chronic-care" element={<ChronicCarePage />} />
        <Route path="ai-assistant" element={<PublicAiPage />} />
      </Route>

      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="signup" element={<Navigate to="/register" replace />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<RequireAuth roles={['patient']} />}>
        <Route element={<DashboardShell title="Patient workspace" />}>
          <Route path="my-appointments" element={<PatientAppointmentsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="pay/:id" element={<PayAppointmentPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="medications" element={<MedicationsPage />} />
          <Route path="my-prescriptions" element={<MedicationsPage />} />
          <Route path="medical-record" element={<MedicalRecordPage />} />
          <Route path="records" element={<MedicalRecordPage />} />
          <Route path="patient/chronic-care/apply" element={<ChronicCareApplyPage />} />
          <Route path="my-profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['doctor']} />}>
        <Route element={<DashboardShell title="Doctor workspace" />}>
          <Route path="doctor-dashboard" element={<DoctorDashboardPage />} />
          <Route path="doctor-appointments" element={<DoctorAppointmentsPage />} />
          <Route path="doctor-calendar" element={<DoctorCalendarPage />} />
          <Route path="patients" element={<DoctorPatientsPage />} />
          <Route path="doctor/availability" element={<DoctorAvailabilityPage />} />
          <Route path="doctor/chronic-care" element={<ChronicCarePage />} />
          <Route path="doctor-profile" element={<DoctorProfilePageDash />} />
          <Route path="doctor-reports" element={<HospitalReportsPage />} />
          <Route path="doctor-messages" element={<MessagesPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['hospital']} />}>
        <Route element={<DashboardShell title="Hospital workspace" />}>
          <Route path="hospital-dashboard" element={<HospitalDashboardPage />} />
          <Route path="hospital-dashboard/doctors" element={<HospitalDoctorsPage />} />
          <Route path="hospital-dashboard/patients" element={<HospitalPatientsPage />} />
          <Route path="hospital-dashboard/reception/appointments" element={<HospitalAppointmentsPage />} />
          <Route path="hospital-dashboard/messages" element={<MessagesPage />} />
          <Route path="hospital-dashboard/reports" element={<HospitalReportsPage />} />
          <Route path="hospital-dashboard/settings" element={<HospitalSettingsPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['admin']} />}>
        <Route element={<DashboardShell title="Admin workspace" />}>
          <Route path="admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="manage-users" element={<ManageUsersPage />} />
          <Route path="doctor-approvals" element={<ApprovalsPage title="Doctor approvals" />} />
          <Route path="hospital-approvals" element={<ApprovalsPage title="Hospital approvals" />} />
          <Route path="all-appointments" element={<AllAppointmentsPage />} />
          <Route path="payment-approvals" element={<HospitalReportsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

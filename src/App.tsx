import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { PatientLogin } from '@/screens/patient/PatientLogin';
import { PatientHome } from '@/screens/patient/PatientHome';
import { PatientDoctors, PatientDoctorProfile, PatientBooking } from '@/screens/patient/PatientDoctors';
import { PatientAppointments, PatientPrescriptions, PatientChat, PatientProfile } from '@/screens/patient/PatientAppointments';
import { ProviderLogin } from '@/screens/provider/ProviderLogin';
import { ProviderRoleSelect } from '@/screens/provider/ProviderRoleSelect';
import { ProviderDashboard, ProviderPatients, ProviderPrescription } from '@/screens/provider/ProviderDashboard';
import { ProviderChat } from '@/screens/provider/ProviderChat';
import { AmbulanceScreen } from '@/screens/provider/AmbulanceScreen';
import { AmbulanceLogin } from '@/screens/provider/AmbulanceLogin';
import { PatientBottomNav, DoctorBottomNav, AmbulanceBottomNav } from '@/components/BottomNav';
import { Icon } from '@/components/Icon';

function AppRoutes() {
  const { pathname } = useLocation();
  const { profile, loading } = useAuth();

  const isAmbulance = pathname.startsWith('/provider/ambulance');
  const isDoctor = pathname.startsWith('/provider') && !isAmbulance;
  const isProvider = isAmbulance || isDoctor;

  const noNavPaths = ['/provider/login', '/provider/ambulance/login', '/provider'];
  const showNav =
    (pathname.startsWith('/patient') && !pathname.includes('/chat/') && !pathname.includes('/booking/') && !pathname.includes('/doctor/') && pathname !== '/patient/otp') ||
    (isProvider && !pathname.includes('/chat/') && !pathname.includes('/prescription/') && !noNavPaths.includes(pathname));

  let nav = null;
  if (showNav) {
    if (isAmbulance) nav = <AmbulanceBottomNav />;
    else if (isDoctor) nav = <DoctorBottomNav />;
    else nav = <PatientBottomNav />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Icon name="loader" size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  const isAuthed = !!profile;

  return (
    <>
      <Routes>
        <Route path="/" element={isAuthed && profile?.role === 'patient' ? <Navigate to="/patient/home" replace /> : isAuthed && profile?.role === 'doctor' ? <Navigate to="/provider/dashboard" replace /> : isAuthed && profile?.role === 'ambulance' ? <Navigate to="/provider/ambulance" replace /> : <PatientLogin />} />
        <Route path="/patient/home" element={<PatientHome />} />
        <Route path="/patient/doctors" element={<PatientDoctors />} />
        <Route path="/patient/doctor/:id" element={<PatientDoctorProfile />} />
        <Route path="/patient/booking/:id" element={<PatientBooking />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
        <Route path="/patient/chat/:id" element={<PatientChat />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/provider" element={<ProviderRoleSelect />} />
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/patients" element={<ProviderPatients />} />
        <Route path="/provider/prescription/new" element={<ProviderPrescription />} />
        <Route path="/provider/chat/:id" element={<ProviderChat />} />
        <Route path="/provider/ambulance/login" element={<AmbulanceLogin />} />
        <Route path="/provider/ambulance" element={<AmbulanceScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {nav}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

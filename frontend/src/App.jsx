import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';

import PatientLogin from './pages/auth/PatientLogin';
import PatientRegister from './pages/auth/PatientRegister';
import AdminLogin from './pages/auth/AdminLogin';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import DoctorForm from './pages/admin/DoctorForm';
import AdminAvailability from './pages/admin/Availability';
import AdminBreaks from './pages/admin/Breaks';
import AdminAppointments from './pages/admin/Appointments';

import PatientLayout from './layouts/PatientLayout';
import PatientDashboard from './pages/patient/Dashboard';
import PatientDoctors from './pages/patient/Doctors';
import DoctorDetail from './pages/patient/DoctorDetail';
import PatientAppointments from './pages/patient/Appointments';
import PatientProfile from './pages/patient/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PatientLogin />} />
            <Route path="/register" element={<PatientRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="doctors/new" element={<DoctorForm />} />
              <Route path="doctors/:id" element={<DoctorForm />} />
              <Route path="availability" element={<AdminAvailability />} />
              <Route path="breaks" element={<AdminBreaks />} />
              <Route path="appointments" element={<AdminAppointments />} />
            </Route>

            <Route
              path="/patient"
              element={
                <ProtectedRoute role="PATIENT">
                  <PatientLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="doctors" element={<PatientDoctors />} />
              <Route path="doctors/:id" element={<DoctorDetail />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

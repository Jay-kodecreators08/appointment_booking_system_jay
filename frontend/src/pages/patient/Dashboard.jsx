import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { fetchMyAppointments } from '../../services/appointment.service';
import { fetchActiveDoctors } from '../../services/doctor.service';
import { formatDate, formatTime, todayISODate } from '../../utils/format';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(null);
  const [doctors, setDoctors] = useState(null);

  useEffect(() => {
    fetchMyAppointments().then(setAppointments).catch(() => setAppointments([]));
    fetchActiveDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  if (!appointments || !doctors) return <Spinner />;

  const today = todayISODate();
  const upcoming = appointments
    .filter((a) => a.status === 'BOOKED' && a.appointmentDate >= today)
    .sort((a, b) => (a.appointmentDate + a.startTime).localeCompare(b.appointmentDate + b.startTime));
  const nextAppointment = upcoming[0];

  return (
    <div>
      <h1 className="page-title">Welcome, {user?.name}</h1>

      <div className="stat-grid">
        <StatCard label="Total Appointments" value={appointments.length} accent="blue" />
        <StatCard label="Upcoming Appointments" value={upcoming.length} accent="green" />
        <StatCard label="Available Doctors" value={doctors.length} accent="purple" />
      </div>

      <div className="dashboard-section">
        <h2>Next Appointment</h2>
        {nextAppointment ? (
          <div className="appointment-card">
            <div className="appointment-card-main">
              <h4>{nextAppointment.doctor?.name}</h4>
              <p className="doctor-specialization">{nextAppointment.doctor?.specialization}</p>
              <p className="appointment-meta">
                {formatDate(nextAppointment.appointmentDate)} &bull; {formatTime(nextAppointment.startTime)} -{' '}
                {formatTime(nextAppointment.endTime)}
              </p>
            </div>
          </div>
        ) : (
          <div className="empty-card">
            <p className="empty-state-message">No upcoming appointments. Book one with a doctor below.</p>
            <div className="quick-actions">
              <Link className="btn btn-primary" to="/patient/doctors">
                Find a Doctor
              </Link>
              <Link className="btn btn-secondary" to="/patient/appointments">
                View My Appointments
              </Link>
            </div>
          </div>
        )}
      </div>

      {nextAppointment && (
        <div className="quick-actions">
          <Link className="btn btn-primary" to="/patient/doctors">
            Find a Doctor
          </Link>
          <Link className="btn btn-secondary" to="/patient/appointments">
            View My Appointments
          </Link>
        </div>
      )}
    </div>
  );
}

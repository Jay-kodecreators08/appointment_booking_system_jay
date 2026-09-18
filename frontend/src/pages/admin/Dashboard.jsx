import { useEffect, useState } from 'react';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import { fetchAdminDashboard } from '../../services/appointment.service';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminDashboard()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="form-error">{error}</p>;
  if (!stats) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="stat-grid">
        <StatCard label="Total Doctors" value={stats.totalDoctors} accent="blue" />
        <StatCard label="Total Patients" value={stats.totalPatients} accent="green" />
        <StatCard label="Total Appointments" value={stats.totalAppointments} accent="purple" />
        <StatCard label="Today's Appointments" value={stats.todaysAppointments} accent="orange" />
        <StatCard label="Cancelled Appointments" value={stats.cancelledAppointments} accent="red" />
      </div>
    </div>
  );
}

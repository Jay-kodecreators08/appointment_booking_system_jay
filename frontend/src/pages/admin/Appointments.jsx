import { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { fetchAdminAppointments } from '../../services/appointment.service';
import { fetchAllDoctors } from '../../services/doctor.service';
import { formatDate, formatTime } from '../../utils/format';

export default function AdminAppointments() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ doctorId: '', date: '', status: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAllDoctors().then(setDoctors).catch(() => {});
  }, []);

  useEffect(() => {
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    fetchAdminAppointments(cleanFilters)
      .then(setAppointments)
      .catch((err) => setError(err.message));
  }, [filters]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const visible = (appointments || []).filter((a) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return a.patient?.name.toLowerCase().includes(q) || a.patient?.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <h1 className="page-title">Appointments</h1>

      <div className="filter-bar">
        <select name="doctorId" value={filters.doctorId} onChange={handleFilterChange}>
          <option value="">All Doctors</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Statuses</option>
          <option value="BOOKED">Booked</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input
          type="text"
          placeholder="Search patient name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="form-error">{error}</p>}
      {!appointments && !error && <Spinner />}
      {appointments && visible.length === 0 && <EmptyState title="No appointments found" />}

      {appointments && visible.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Email</th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient?.name}</td>
                  <td>{a.patient?.email}</td>
                  <td>{a.doctor?.name}</td>
                  <td>{a.doctor?.specialization}</td>
                  <td>{formatDate(a.appointmentDate)}</td>
                  <td>{formatTime(a.startTime)}</td>
                  <td>{formatTime(a.endTime)}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

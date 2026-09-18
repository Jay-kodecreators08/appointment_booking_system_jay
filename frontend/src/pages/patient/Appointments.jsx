import { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import AppointmentCard from '../../components/AppointmentCard';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';
import { fetchMyAppointments, cancelAppointment } from '../../services/appointment.service';
import { todayISODate } from '../../utils/format';

const TABS = ['Upcoming', 'Past', 'Cancelled'];

export default function PatientAppointments() {
  const { notify } = useNotification();
  const [appointments, setAppointments] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Upcoming');
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = () => {
    fetchMyAppointments()
      .then(setAppointments)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const handleCancel = async () => {
    try {
      await cancelAppointment(cancelTarget.id);
      notify('Appointment cancelled successfully.');
      setCancelTarget(null);
      load();
    } catch (err) {
      notify(err.message, 'error');
      setCancelTarget(null);
    }
  };

  const today = todayISODate();
  const grouped = {
    Upcoming: (appointments || []).filter((a) => a.status === 'BOOKED' && a.appointmentDate >= today),
    Past: (appointments || []).filter((a) => a.status === 'BOOKED' && a.appointmentDate < today),
    Cancelled: (appointments || []).filter((a) => a.status === 'CANCELLED'),
  };
  const visible = grouped[tab] || [];

  return (
    <div>
      <h1 className="page-title">My Appointments</h1>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button key={t} className={`tab-btn${tab === t ? ' tab-btn-active' : ''}`} onClick={() => setTab(t)}>
            {t} ({grouped[t]?.length ?? 0})
          </button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}
      {!appointments && !error && <Spinner />}
      {appointments && visible.length === 0 && <EmptyState title={`No ${tab.toLowerCase()} appointments`} />}

      <div className="appointment-list">
        {visible.map((a) => (
          <AppointmentCard
            key={a.id}
            appointment={a}
            onCancel={tab === 'Upcoming' ? setCancelTarget : undefined}
          />
        ))}
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel appointment?"
        message="This slot will become available for other patients to book."
        confirmLabel="Cancel Appointment"
        danger
        onCancel={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
    </div>
  );
}

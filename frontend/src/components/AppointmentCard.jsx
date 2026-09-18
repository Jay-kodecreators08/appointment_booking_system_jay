import { formatDate, formatTime } from '../utils/format';
import StatusBadge from './StatusBadge';

export default function AppointmentCard({ appointment, onCancel }) {
  const canCancel = appointment.status === 'BOOKED';

  return (
    <div className="appointment-card">
      <div className="appointment-card-main">
        <h4>{appointment.doctor?.name}</h4>
        <p className="doctor-specialization">{appointment.doctor?.specialization}</p>
        <p className="appointment-meta">
          {formatDate(appointment.appointmentDate)} &bull; {formatTime(appointment.startTime)} -{' '}
          {formatTime(appointment.endTime)}
        </p>
        <p className="appointment-meta-small">Booked on {new Date(appointment.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="appointment-card-side">
        <StatusBadge status={appointment.status} />
        {canCancel && onCancel && (
          <button className="btn btn-danger btn-sm" onClick={() => onCancel(appointment)}>
            Cancel Appointment
          </button>
        )}
      </div>
    </div>
  );
}

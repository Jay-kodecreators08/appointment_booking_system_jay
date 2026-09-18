import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <h3>{doctor.name}</h3>
        <StatusBadge status={doctor.status} />
      </div>
      <p className="doctor-specialization">{doctor.specialization}</p>
      <p className="doctor-meta">{doctor.email}</p>
      <p className="doctor-meta">{doctor.phone}</p>
      <button className="btn btn-primary btn-block" onClick={() => navigate(`/patient/doctors/${doctor.id}`)}>
        View Availability
      </button>
    </div>
  );
}

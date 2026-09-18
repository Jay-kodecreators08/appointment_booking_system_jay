import { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import DoctorCard from '../../components/DoctorCard';
import { fetchActiveDoctors } from '../../services/doctor.service';

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveDoctors()
      .then(setDoctors)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="page-title">Doctors</h1>
      {error && <p className="form-error">{error}</p>}
      {!doctors && !error && <Spinner />}
      {doctors && doctors.length === 0 && <EmptyState title="No doctors available right now" />}
      {doctors && doctors.length > 0 && (
        <div className="doctor-grid">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}

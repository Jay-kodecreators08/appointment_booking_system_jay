import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useNotification } from '../../context/NotificationContext';
import { fetchAllDoctors, deactivateDoctor, activateDoctor } from '../../services/doctor.service';

export default function AdminDoctors() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [doctors, setDoctors] = useState(null);
  const [error, setError] = useState('');
  const [toggleTarget, setToggleTarget] = useState(null);

  const load = () => {
    fetchAllDoctors()
      .then(setDoctors)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const handleToggle = async () => {
    try {
      if (toggleTarget.status === 'ACTIVE') {
        await deactivateDoctor(toggleTarget.id);
        notify('Doctor deactivated.');
      } else {
        await activateDoctor(toggleTarget.id);
        notify('Doctor activated.');
      }
      setToggleTarget(null);
      load();
    } catch (err) {
      notify(err.message, 'error');
      setToggleTarget(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Doctors</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/doctors/new')}>
          + Add Doctor
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
      {!doctors && !error && <Spinner />}

      {doctors && doctors.length === 0 && (
        <EmptyState title="No doctors yet" message="Add your first doctor to get started." />
      )}

      {doctors && doctors.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.phone}</td>
                  <td>
                    <StatusBadge status={doctor.status} />
                  </td>
                  <td className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/doctors/${doctor.id}`)}>
                      Edit
                    </button>
                    <button
                      className={`btn btn-sm ${doctor.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => setToggleTarget(doctor)}
                    >
                      {doctor.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.status === 'ACTIVE' ? 'Deactivate doctor?' : 'Activate doctor?'}
        message={
          toggleTarget?.status === 'ACTIVE'
            ? `${toggleTarget?.name} will no longer be bookable by patients. Existing appointments are kept.`
            : `${toggleTarget?.name} will become bookable by patients again.`
        }
        confirmLabel={toggleTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        danger={toggleTarget?.status === 'ACTIVE'}
        onCancel={() => setToggleTarget(null)}
        onConfirm={handleToggle}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import TimeSelect from '../../components/TimeSelect';
import { useNotification } from '../../context/NotificationContext';
import { fetchAllDoctors } from '../../services/doctor.service';
import { fetchAvailability, setAvailability, updateAvailability, deleteAvailability } from '../../services/availability.service';
import { formatDate, formatTime, todayISODate } from '../../utils/format';

const EMPTY_FORM = { doctorId: '', date: '', startTime: '', endTime: '' };

export default function AdminAvailability() {
  const { notify } = useNotification();
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailabilityList] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadAvailability = () => {
    fetchAvailability()
      .then(setAvailabilityList)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchAllDoctors()
      .then(setDoctors)
      .catch((err) => setError(err.message));
    loadAvailability();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setForm({ doctorId: a.doctorId, date: a.date, startTime: a.startTime, endTime: a.endTime });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await updateAvailability(editingId, { startTime: form.startTime, endTime: form.endTime });
        notify('Availability period updated successfully.');
      } else {
        await setAvailability(form);
        notify('Availability period added successfully.');
      }
      cancelEdit();
      loadAvailability();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAvailability(deleteTarget.id);
      notify('Availability period removed successfully.');
      setDeleteTarget(null);
      loadAvailability();
    } catch (err) {
      notify(err.message, 'error');
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Doctor Availability</h1>

      <form className="form form-card form-inline" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          <span>Doctor</span>
          <select name="doctorId" value={form.doctorId} onChange={handleChange} disabled={!!editingId} required>
            <option value="">Select doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Date</span>
          <input
            type="date"
            name="date"
            min={todayISODate()}
            value={form.date}
            onChange={handleChange}
            disabled={!!editingId}
            required
          />
        </label>
        <label className="field">
          <span>Start Time</span>
          <TimeSelect name="startTime" value={form.startTime} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>End Time</span>
          <TimeSelect name="endTime" value={form.endTime} onChange={handleChange} required />
        </label>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Save Changes' : '+ Add Availability'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>
      <p className="form-hint">
        A doctor can have multiple availability periods on the same date (e.g. 09:00-13:00 and 14:00-17:00), as
        long as they don't overlap. Add another period for the same doctor/date instead of editing this one.
      </p>

      {!availability && <Spinner />}
      {availability && availability.length === 0 && <EmptyState title="No availability set yet" />}
      {availability && availability.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {availability.map((a) => (
                <tr key={a.id}>
                  <td>{a.doctor?.name}</td>
                  <td>{formatDate(a.date)}</td>
                  <td>{formatTime(a.startTime)}</td>
                  <td>{formatTime(a.endTime)}</td>
                  <td className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(a)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(a)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove availability period?"
        message={`This will remove this availability period for ${deleteTarget?.doctor?.name} on ${deleteTarget ? formatDate(deleteTarget.date) : ''}.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

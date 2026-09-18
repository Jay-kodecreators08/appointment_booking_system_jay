import { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import TimeSelect from '../../components/TimeSelect';
import { useNotification } from '../../context/NotificationContext';
import { fetchAllDoctors } from '../../services/doctor.service';
import { fetchBreaks, createBreak, updateBreak, deleteBreak } from '../../services/break.service';
import { formatDate, formatTime, todayISODate } from '../../utils/format';

const EMPTY_FORM = { doctorId: '', date: '', startTime: '', endTime: '', reason: '' };

export default function AdminBreaks() {
  const { notify } = useNotification();
  const [doctors, setDoctors] = useState([]);
  const [breaks, setBreaksList] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadBreaks = () => {
    fetchBreaks()
      .then(setBreaksList)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    fetchAllDoctors()
      .then(setDoctors)
      .catch((err) => setError(err.message));
    loadBreaks();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setForm({ doctorId: b.doctorId, date: b.date, startTime: b.startTime, endTime: b.endTime, reason: b.reason || '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const result = editingId ? await updateBreak(editingId, form) : await createBreak(form);
      notify(result.message);
      cancelEdit();
      loadBreaks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBreak(deleteTarget.id);
      notify('Break removed successfully.');
      setDeleteTarget(null);
      loadBreaks();
    } catch (err) {
      notify(err.message, 'error');
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Doctor Breaks</h1>

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
        <label className="field">
          <span>Reason (optional)</span>
          <input name="reason" value={form.reason} onChange={handleChange} placeholder="Doctor meeting" />
        </label>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Save Changes' : '+ Add Break'}
        </button>
        {editingId && (
          <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>
      <p className="form-hint">
        A break must fall entirely within one of the doctor's availability periods. If existing appointments fall
        inside the new break, they are automatically moved to the nearest free slot for the same doctor and date.
      </p>

      {!breaks && <Spinner />}
      {breaks && breaks.length === 0 && <EmptyState title="No breaks set yet" />}
      {breaks && breaks.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {breaks.map((b) => (
                <tr key={b.id}>
                  <td>{b.doctor?.name}</td>
                  <td>{formatDate(b.date)}</td>
                  <td>{formatTime(b.startTime)}</td>
                  <td>{formatTime(b.endTime)}</td>
                  <td>{b.reason || '-'}</td>
                  <td className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(b)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(b)}>
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
        title="Remove break?"
        message={`This will remove this break for ${deleteTarget?.doctor?.name} on ${deleteTarget ? formatDate(deleteTarget.date) : ''}. Appointments are not moved back automatically.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

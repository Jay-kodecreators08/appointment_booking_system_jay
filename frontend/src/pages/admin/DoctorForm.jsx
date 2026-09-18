import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import { useNotification } from '../../context/NotificationContext';
import { createDoctor, updateDoctor } from '../../services/doctor.service';
import api from '../../services/api';

const EMPTY_FORM = { name: '', email: '', phone: '', specialization: '', status: 'ACTIVE' };

export default function DoctorForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/admin/doctors/${id}`)
      .then((r) => r.data.data)
      .then((doctor) => setForm({ name: doctor.name, email: doctor.email, phone: doctor.phone, specialization: doctor.specialization, status: doctor.status }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await updateDoctor(id, form);
        notify('Doctor updated successfully.');
      } else {
        await createDoctor(form);
        notify('Doctor added successfully.');
      }
      navigate('/admin/doctors');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">{isEdit ? 'Edit Doctor' : 'Add Doctor'}</h1>
      <form className="form form-card" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <label className="field">
          <span>Name</span>
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Phone</span>
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Specialization</span>
          <input name="specialization" value={form.specialization} onChange={handleChange} required />
        </label>
        {isEdit && (
          <label className="field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/doctors')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Doctor'}
          </button>
        </div>
      </form>
    </div>
  );
}

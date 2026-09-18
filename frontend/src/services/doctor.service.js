import api from './api';

// Patient-facing (public/active doctors only)
export const fetchActiveDoctors = () => api.get('/doctors').then((r) => r.data.data);
export const fetchDoctor = (id) => api.get(`/doctors/${id}`).then((r) => r.data.data);
export const fetchDoctorAvailability = (id, date) =>
  api.get(`/doctors/${id}/availability`, { params: { date } }).then((r) => r.data.data);
export const fetchDoctorSlots = (id, date) =>
  api.get(`/doctors/${id}/slots`, { params: { date } }).then((r) => r.data.data);

// Admin-facing (all doctors, management)
export const fetchAllDoctors = () => api.get('/admin/doctors').then((r) => r.data.data);
export const createDoctor = (payload) => api.post('/admin/doctors', payload).then((r) => r.data.data);
export const updateDoctor = (id, payload) => api.put(`/admin/doctors/${id}`, payload).then((r) => r.data.data);
export const deactivateDoctor = (id) => api.delete(`/admin/doctors/${id}`).then((r) => r.data.data);
export const activateDoctor = (id) => api.patch(`/admin/doctors/${id}/activate`).then((r) => r.data.data);

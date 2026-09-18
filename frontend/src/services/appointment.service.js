import api from './api';

export const bookAppointment = (payload) => api.post('/appointments', payload).then((r) => r.data.data);

export const fetchMyAppointments = () => api.get('/appointments/my').then((r) => r.data.data);

export const cancelAppointment = (id) => api.patch(`/appointments/${id}/cancel`).then((r) => r.data.data);

export const fetchAdminAppointments = (filters) =>
  api.get('/admin/appointments', { params: filters }).then((r) => r.data.data);

export const fetchAdminDashboard = () => api.get('/admin/dashboard').then((r) => r.data.data);

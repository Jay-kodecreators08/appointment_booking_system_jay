import api from './api';

export const fetchAvailability = (doctorId) =>
  api.get('/admin/availability', { params: doctorId ? { doctorId } : {} }).then((r) => r.data.data);

export const setAvailability = (payload) => api.post('/admin/availability', payload).then((r) => r.data.data);

export const updateAvailability = (id, payload) =>
  api.put(`/admin/availability/${id}`, payload).then((r) => r.data.data);

export const deleteAvailability = (id) => api.delete(`/admin/availability/${id}`).then((r) => r.data.data);

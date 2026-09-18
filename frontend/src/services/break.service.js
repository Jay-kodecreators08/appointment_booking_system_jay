import api from './api';

export const fetchBreaks = (doctorId) =>
  api.get('/admin/breaks', { params: doctorId ? { doctorId } : {} }).then((r) => r.data.data);

export const createBreak = (payload) => api.post('/admin/breaks', payload).then((r) => r.data);

export const updateBreak = (id, payload) => api.put(`/admin/breaks/${id}`, payload).then((r) => r.data);

export const deleteBreak = (id) => api.delete(`/admin/breaks/${id}`).then((r) => r.data.data);

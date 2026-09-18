import api from './api';

export const registerPatient = (payload) => api.post('/auth/register', payload).then((r) => r.data.data);

export const loginPatient = (payload) => api.post('/auth/login', payload).then((r) => r.data.data);

export const loginAdmin = (payload) => api.post('/auth/admin-login', payload).then((r) => r.data.data);

export const fetchCurrentUser = () => api.get('/auth/me').then((r) => r.data.data);

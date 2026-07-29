import api from './axios';

export const getChallans = (params: Record<string, any>) =>
  api.get('/challans', { params }).then((r) => r.data);

export const getChallan = (id: string) => api.get(`/challans/${id}`).then((r) => r.data);

export const createChallan = (payload: any) => api.post('/challans', payload).then((r) => r.data);

export const updateChallanStatus = (id: string, status: 'confirmed' | 'cancelled') =>
  api.patch(`/challans/${id}/status`, { status }).then((r) => r.data);
import api from './axios';

export const getCustomers = (params: Record<string, any>) =>
  api.get('/customers', { params }).then((r) => r.data);

export const getCustomer = (id: string) => api.get(`/customers/${id}`).then((r) => r.data);

export const createCustomer = (payload: any) => api.post('/customers', payload).then((r) => r.data);

export const updateCustomer = (id: string, payload: any) =>
  api.patch(`/customers/${id}`, payload).then((r) => r.data);

export const addFollowup = (customerId: string, payload: any) =>
  api.post(`/customers/${customerId}/followups`, payload).then((r) => r.data);
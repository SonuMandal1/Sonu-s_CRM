import api from './axios';

export const getProducts = (params: Record<string, any>) =>
  api.get('/products', { params }).then((r) => r.data);

export const getProduct = (id: string) => api.get(`/products/${id}`).then((r) => r.data);

export const createProduct = (payload: any) => api.post('/products', payload).then((r) => r.data);

export const updateProduct = (id: string, payload: any) =>
  api.patch(`/products/${id}`, payload).then((r) => r.data);

export const adjustStock = (id: string, payload: any) =>
  api.post(`/products/${id}/stock-adjustment`, payload).then((r) => r.data);

export const getCategories = () => api.get('/products/categories').then((r) => r.data);
export const getWarehouses = () => api.get('/products/warehouses').then((r) => r.data);
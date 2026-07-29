import api from './axios';

export const loginRequest = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);
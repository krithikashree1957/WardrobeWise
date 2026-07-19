import axios from 'axios';

/**
 * Central Axios instance. Attaches the JWT access token to every request
 * and redirects to /login on 401 responses (expired/invalid token).
 */
export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ww_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ww_access_token');
      localStorage.removeItem('ww_refresh_token');
      localStorage.removeItem('ww_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

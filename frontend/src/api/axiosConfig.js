import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../store/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry on login/register/refresh endpoints
    const url = originalRequest?.url || '';
    const isAuthEndpoint =
      url.includes('accounts/login/') ||
      url.includes('accounts/register/') ||
      url.includes('accounts/google/verify/') ||
      url.includes('accounts/token/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = store.getState().auth.refresh;

      // No refresh token → user really is logged out
      if (!refreshToken) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/';
        const res = await axios.post(`${base}accounts/token/refresh/`, {
          refresh: refreshToken,
        });

        const newToken = res.data.access;
        const currentUser = store.getState().auth.user;

        store.dispatch(
          setCredentials({
            user: currentUser,
            token: newToken,
            refresh: refreshToken,
          })
        );

        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'helpdesk_token';
export const USER_STORAGE_KEY = 'helpdesk_user';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      if (!isAuthEndpoint) {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.localStorage.removeItem(USER_STORAGE_KEY);

        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.replace('/login');
        }
      }
    }

    return Promise.reject(error);
  }
);


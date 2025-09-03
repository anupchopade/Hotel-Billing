import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const api = axios.create({
  baseURL: baseURL || '/api',
  withCredentials: false
});

function getAccessToken() {
  return localStorage.getItem('access_token') || '';
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pending: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && baseURL) {
      original._retry = true;
      if (isRefreshing) {
        await new Promise<void>((resolve) => pending.push(resolve));
      } else {
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('No refresh token');
          const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          localStorage.setItem('access_token', res.data.accessToken);
          localStorage.setItem('refresh_token', res.data.refreshToken);
          pending.forEach(r => r());
          pending = [];
        } catch (e) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          throw e;
        } finally {
          isRefreshing = false;
        }
      }
      return api(original);
    }
    return Promise.reject(error);
  }
);



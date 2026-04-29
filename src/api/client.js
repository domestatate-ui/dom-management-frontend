import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('dom_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401, except on auth pages
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const onAuthPage = ['/login', '/register'].includes(window.location.pathname);
    if (err.response?.status === 401 && !onAuthPage) {
      localStorage.removeItem('dom_token');
      localStorage.removeItem('dom_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;

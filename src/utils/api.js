import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-focus-seu6.onrender.com' || import.meta.env.VITE_API_URL ,
  timeout: 15000,
});
// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('tvs_user') || 'null');
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  } catch {}
  return config;
});

// Global 401 handling — only redirect if user had a token (prevents infinite loop)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        const user = JSON.parse(localStorage.getItem('tvs_user') || 'null');
        // Only clear + redirect if they were actually logged in
        if (user?.token) {
          localStorage.removeItem('tvs_user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
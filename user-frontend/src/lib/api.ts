import axios from 'axios';

// Dynamically determine API base URL
// In development, it might be localhost:3000
// In production, it will be the same origin
const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true, // Crucial for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Avoid infinite loop if checkAuth fails or if we're already on login page
    const isAuthCheck = error.config?.url?.includes('/organizations/me');
    const isLoginPage = window.location.pathname === '/login';

    if (error.response?.status === 401 && !isAuthCheck && !isLoginPage) {
      // Redirect to login if unauthorized and not already on login/auth check
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

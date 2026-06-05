import axios from 'axios';

// Dynamically determine API base URL
// In development, it might be localhost:3000
// In production, it will be the same origin
const API_ADMIN_BASE = import.meta.env.VITE_API_ADMIN_URL || '';
const API_USER_BASE = import.meta.env.VITE_API_USER_URL || '';

const adminapi = axios.create({
  baseURL: `${API_ADMIN_BASE}/api`,
  withCredentials: true, // Crucial for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

const userapi = axios.create({
  baseURL: `${API_USER_BASE}/api`,
  withCredentials: true, // Crucial for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
adminapi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url?.includes('/auth/me');
    const isLoginPage = window.location.pathname === '/login';

    if (error.response?.status === 401 && !isAuthCheck && !isLoginPage) {
      // Redirect to login if unauthorized and not already on login/auth check
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// Response interceptor for global error handling
userapi.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export { adminapi, userapi };
export default adminapi;

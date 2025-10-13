import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token now comes from cookies automatically
api.interceptors.request.use(
  (config) => {
    // Fallback: Check localStorage for mobile/API clients
    const token = localStorage.getItem('token');
    if (token && !config.headers.Cookie) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Cookies will be sent automatically with withCredentials: true
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Tokens are now in cookies, no need to store in localStorage
        // But keep fallback for compatibility
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Clear any fallback tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

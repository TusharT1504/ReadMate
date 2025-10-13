import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// When the API rejects us with 401, try refreshing the session once before bubbling up.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't attempt refresh for:
    // 1. Auth endpoints (login, register, refresh itself)
    // 2. Requests that already tried to refresh
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and don't redirect from interceptor
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

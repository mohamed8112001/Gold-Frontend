import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, ROUTES } from '../utils/constants.js';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token using cookies
        const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
          withCredentials: true
        });

        const { accessToken } = response.data;
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = ROUTES.LOGIN;
      }
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiRequest = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

// Error handler
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'طلب غير صحيح';
      case 401:
        return 'غير مصرح لك بالوصول';
      case 403:
        return 'ممنوع الوصول';
      case 404:
        return 'المورد غير موجود';
      case 422:
        return data.message || 'بيانات غير صحيحة';
      case 500:
        return 'خطأ في الخادم';
      default:
        return data.message || 'حدث خطأ غير متوقع';
    }
  } else if (error.request) {
    // Network error
    return 'خطأ في الاتصال بالشبكة';
  } else {
    // Other error
    return error.message || 'حدث خطأ غير متوقع';
  }
};

export default api;


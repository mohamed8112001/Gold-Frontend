import api from './api.js';
import { STORAGE_KEYS } from '../utils/constants.js';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Backend register doesn't return accessToken, just success message
      // User needs to login separately after registration
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.accessToken) {
        // Save token first
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.accessToken);

        // Wait a bit to ensure token is saved, then get user data
        try {
          const userResponse = await api.get('/user/me', {
            headers: {
              'Authorization': `Bearer ${response.data.accessToken}`
            }
          });
          // Backend returns { status: "success", data: userData }
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userResponse.data.data));
        } catch (userError) {
          console.warn('Failed to fetch user data:', userError);
          // Continue with login even if user data fetch fails
        }
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.get('/auth/refresh');
      if (response.data.accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      throw new Error('Token refresh failed');
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/user/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/user/reset-password/${token}`, {
        password: newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  // Google OAuth login
  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  },

  // Handle Google OAuth callback
  handleGoogleCallback: async () => {
    try {
      // The backend will handle the callback and set cookies
      // We need to get the user data after successful OAuth
      const userResponse = await api.get('/user/me');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userResponse.data.user));
      return userResponse.data;
    } catch (error) {
      throw new Error('Google authentication failed');
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
};


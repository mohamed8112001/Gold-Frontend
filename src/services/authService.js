import api from "./api.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.accessToken);
        try {
          const userResponse = await api.get("/user/me", {
            headers: {
              Authorization: `Bearer ${response.data.accessToken}`,
            },
          });
          localStorage.setItem(
            STORAGE_KEYS.USER,
            JSON.stringify(userResponse.data.data)
          );
        } catch (userError) {
          console.warn("Failed to fetch user data:", userError);
        }
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.get("/auth/refresh");
      if (response.data.accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      throw new Error("Token refresh failed");
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/user/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to send reset email"
      );
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(`/user/reset-password/${token}`, {
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Password reset failed");
    }
  },

  // Google OAuth authentication
  googleAuth: async (credential, userType) => {
    try {
      // Send the Google ID token (credential) to the backend
      const response = await api.post("/auth/google", { credential , userType});
      console.log(`response data: ${JSON.stringify(response.data)}`);
      
      // Assuming backend returns { accessToken, user, isNewUser }
      if (response.data.accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.accessToken);
        localStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(response.data.user)
        );
      }
      
      return {
        user: response.data.user,
        isNewUser: response.data.isNewUser || false,
      };
    } catch (error) {
      console.log(`error: ${error}`);
      
      throw new Error(error.response?.data?.message || "Google authentication failed");
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
  },
};
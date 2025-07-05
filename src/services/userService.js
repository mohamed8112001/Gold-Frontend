import api from "./api.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const userService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get("/user/me");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put("/user", userData);
      // Update local storage
      const currentUser = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USER) || "{}"
      );
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  },

  // Update user role
  updateRole: async (role) => {
    try {
      // Try different endpoints that might work
      let response;
      try {
        // Try the profile update endpoint with role
        response = await api.put("/user", { role });
      } catch {
        try {
          // Try patch method
          response = await api.patch("/user", { role });
        } catch {
          // Try specific role endpoint
          response = await api.patch("/user/role", { role });
        }
      }

      // Update local storage
      const currentUser = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USER) || "{}"
      );
      const updatedUser = { ...currentUser, role };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update role");
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await api.delete("/user");
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete account"
      );
    }
  },

  // Reset password (when logged in)
  resetPassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post("/user/reset_password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  },

  // Upload profile picture - NOT IMPLEMENTED IN BACKEND
  uploadProfilePicture: async () => {
    try {
      // This endpoint doesn't exist in backend, would need to be added
      throw new Error(
        "Profile picture upload is not yet implemented in the backend"
      );
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to upload profile picture"
      );
    }
  },

  // Get user statistics - NOT IMPLEMENTED IN BACKEND
  getUserStats: async () => {
    try {
      // This endpoint doesn't exist in backend, would need to be added
      throw new Error(
        "User statistics feature is not yet implemented in the backend"
      );
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user statistics"
      );
    }
  },

  // Admin functions
  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get("/user/admin/all", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch users");
    }
  },

  // Get user by ID (admin only)
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/user/admin/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user");
    }
  },

  // Update user (admin only)
  updateUserAdmin: async (userId, userData) => {
    try {
      const response = await api.put(`/user/admin/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update user");
    }
  },

  // Delete user (admin only)
  deleteUserAdmin: async (userId) => {
    try {
      const response = await api.delete(`/user/admin/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete user");
    }
  },

  // Block/Unblock user (admin only)
  toggleUserStatus: async (userId) => {
    try {
      const response = await api.put(`/user/admin/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to toggle user status"
      );
    }
  },
<<<<<<< 
};
=======
};
>>>>>>> 85f67a2d071b5831fabbe48782b6a10de32d8cbc

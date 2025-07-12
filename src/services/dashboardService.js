import api from "./api.js";

export const dashboardService = {
  // Get user dashboard statistics
  getUserStats: async () => {
    try {
      const response = await api.get("/dashboard/user/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user stats"
      );
    }
  },

  // Get user's recent activity
  getRecentActivity: async (limit = 10) => {
    try {
      const response = await api.get(`/dashboard/user/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch recent activity"
      );
    }
  },

  // Get user's favorite items
  getFavorites: async (limit = 10) => {
    try {
      const response = await api.get(`/user/favorites?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch favorites"
      );
    }
  },

  // Get user's bookings
  getBookings: async (status = "all", limit = 10) => {
    try {
      const params = { limit };
      if (status !== "all") {
        params.status = status;
      }
      const response = await api.get("/dashboard/user/bookings", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch bookings"
      );
    }
  },

  // Get shop owner dashboard statistics
  getShopOwnerStats: async () => {
    try {
      const response = await api.get("/dashboard/shop/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch shop owner stats"
      );
    }
  },

  // Get shop owner's recent orders/bookings
  getShopOwnerActivity: async (limit = 10) => {
    try {
      const response = await api.get(`/dashboard/shop/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch shop owner activity"
      );
    }
  },

  // Add item to favorites
  addToFavorites: async (itemId, itemType = "product") => {
    try {
      const response = await api.post("/user/favorites", {
        itemId,
        itemType,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to add to favorites"
      );
    }
  },

  // Remove item from favorites
  removeFromFavorites: async (favoriteId) => {
    try {
      const response = await api.delete(`/user/favorites/${favoriteId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to remove from favorites"
      );
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/user/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to cancel booking"
      );
    }
  },

  // Update booking
  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await api.patch(
        `/user/bookings/${bookingId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update booking"
      );
    }
  },

  // Available Times Management (Shop Owner)
  // Get available times for shop owner
  getAvailableTimes: async () => {
    try {
      const response = await api.get("/booking/shop/bookings");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch available times"
      );
    }
  },

  // Add new available time slot
  addAvailableTime: async (timeSlotData) => {
    try {
      const response = await api.post("/booking/available-time", timeSlotData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to add available time"
      );
    }
  },

  // Delete available time slot
  deleteAvailableTime: async (timeId) => {
    try {
      const response = await api.delete(`/booking/available-time/${timeId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete available time"
      );
    }
  },

  // Get available times for a specific shop (for booking)
  getShopAvailableTimes: async (shopId) => {
    try {
      const response = await api.get(`/booking/available/${shopId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch shop available times"
      );
    }
  },

  // Book an available time slot
  bookAvailableTime: async (timeId) => {
    try {
      const response = await api.post(`/available-times/${timeId}/book`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to book available time"
      );
    }
  },
};

export default dashboardService;

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
      console.log("=== DASHBOARD SERVICE: ADDING AVAILABLE TIME ===");
      console.log("Sending time data to API:", timeSlotData);
      console.log("API endpoint: POST /booking/available-time");
      console.log(
        "Full API URL:",
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
        }/booking/available-time`
      );

      // Check authentication
      const token = localStorage.getItem("token");
      console.log("Auth token exists:", !!token);
      console.log(
        "Auth token (first 20 chars):",
        token ? token.substring(0, 20) + "..." : "No token"
      );

      // Try different possible endpoints
      let response;
      try {
        console.log("Trying endpoint: /booking/available-time");
        response = await api.post("/booking/available-time", timeSlotData);
      } catch (firstError) {
        console.log("First endpoint failed, trying: /available-time");
        try {
          response = await api.post("/available-time", timeSlotData);
        } catch (secondError) {
          console.log("Second endpoint failed, trying: /booking/add-time");
          try {
            response = await api.post("/booking/add-time", timeSlotData);
          } catch (thirdError) {
            console.log("All endpoints failed, throwing original error");
            throw firstError;
          }
        }
      }

      console.log("API response status:", response.status);
      console.log("API response:", response);
      console.log("API response data:", response.data);
      console.log("=== END DASHBOARD SERVICE: ADDING AVAILABLE TIME ===");

      return response.data;
    } catch (error) {
      console.error("=== DASHBOARD SERVICE ERROR ===");
      console.error("Error adding available time:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("=== END DASHBOARD SERVICE ERROR ===");

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
  bookAvailableTime: async (bookingData) => {
    try {
      console.log(
        "📤 Sending booking request to /booking/book with data:",
        bookingData
      );
      const response = await api.post("/booking/book", bookingData);
      console.log("📥 Booking API response:", response);
      return response.data;
    } catch (error) {
      console.error("❌ Booking API error:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      throw new Error(
        error.response?.data?.message || "Failed to book available time"
      );
    }
  },
};

export default dashboardService;

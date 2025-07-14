import api from "./api.js";

export const bookingService = {
  // Get all bookings for the current user
  async getUserBookings(params = {}) {
    try {
      const response = await api.get("/booking/my-bookings", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
  },

  // Get all bookings for shop owner
  async getShopBookings(params = {}) {
    try {
      const response = await api.get("/booking/shop/bookings", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching shop bookings:", error);
      throw error;
    }
  },

  // Get all times (available and booked) for shop owner
  async getAllShopTimes(shopId = null) {
    try {
      console.log("Getting all shop times for shopId:", shopId);

      // Get booked times first
      const bookedResponse = await api.get("/booking/shop/bookings");
      console.log("Booked response:", bookedResponse);

      // Try to get available times - we'll try different endpoints
      let availableResponse;
      try {
        // Try the shop-specific endpoint first
        if (shopId) {
          availableResponse = await api.get(`/booking/available/${shopId}`);
        } else {
          // Try a general available times endpoint
          availableResponse = await api.get("/booking/available-times");
        }
      } catch (availableError) {
        console.log(
          "Available times endpoint failed, trying alternative:",
          availableError
        );
        // If that fails, try without shopId
        try {
          availableResponse = await api.get("/booking/available");
        } catch (secondError) {
          console.log("Second available endpoint failed:", secondError);
          // If all fail, just return booked times
          availableResponse = { data: [] };
        }
      }

      console.log("Available response:", availableResponse);

      // Combine both arrays
      const availableTimes = (
        availableResponse.data?.data ||
        availableResponse.data ||
        []
      ).map((time) => ({
        ...time,
        isBooked: false,
      }));

      const bookedTimes = (
        bookedResponse.data?.data ||
        bookedResponse.data ||
        []
      ).map((time) => ({
        ...time,
        isBooked: true,
      }));

      console.log("Available times:", availableTimes);
      console.log("Booked times:", bookedTimes);

      return {
        success: true,
        data: [...availableTimes, ...bookedTimes],
      };
    } catch (error) {
      console.error("Error fetching all shop times:", error);
      throw error;
    }
  },

  // Get all times (available and booked) for a specific shop - for customers
  async getAvailableTimesForShop(shopId) {
    try {
      console.log("Getting all times for shop (customer view):", shopId);

      // Try to get all times for the shop (both available and booked)
      let allTimesResponse;
      try {
        // Try the shop-specific endpoint with includeBooked parameter
        if (shopId) {
          console.log(
            "Trying shop-specific endpoint with includeBooked:",
            `/booking/available/${shopId}?includeBooked=true`
          );
          allTimesResponse = await api.get(
            `/booking/available/${shopId}?includeBooked=true`
          );

          // The API should now return all times (available and booked)
          const allTimes = allTimesResponse.data || [];
          console.log("All times from API (available and booked):", allTimes);

          return {
            status: "success",
            data: allTimes,
          };
        } else {
          throw new Error("Shop ID is required");
        }
      } catch (error) {
        console.error("Error getting times for shop:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error fetching all times for customer:", error);
      throw error;
    }
  },

  // Create a new booking
  async createBooking(bookingData) {
    try {
      const response = await api.post("/booking", bookingData);
      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await api.patch(`/booking/${bookingId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  },

  // Get available time slots for a shop
  async getAvailableTimesForShop(shopId, date = null) {
    try {
      const params = date ? { date } : {};
      const response = await api.get(`/booking/available/${shopId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching available time slots:", error);
      throw error;
    }
  },

  // Add available time slot (for shop owners)
  async addAvailableTime(timeData) {
    try {
      console.log("=== ADDING AVAILABLE TIME ===");
      console.log("Sending time data to API:", timeData);
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
        response = await api.post("/booking/available-time", timeData);
      } catch (firstError) {
        console.log("First endpoint failed, trying: /available-time");
        try {
          response = await api.post("/available-time", timeData);
        } catch (secondError) {
          console.log("Second endpoint failed, trying: /booking/add-time");
          try {
            response = await api.post("/booking/add-time", timeData);
          } catch (thirdError) {
            console.log("All endpoints failed, throwing original error");
            throw firstError;
          }
        }
      }
      console.log("API response status:", response.status);
      console.log("API response:", response);
      console.log("API response data:", response.data);
      console.log("=== END ADDING AVAILABLE TIME ===");

      return response.data;
    } catch (error) {
      console.error("=== ERROR ADDING AVAILABLE TIME ===");
      console.error("Error adding available time:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("=== END ERROR ===");
      throw error;
    }
  },

  // Remove available time slot (for shop owners)
  async removeAvailableTime(timeId) {
    try {
      const response = await api.delete(`/booking/available-time/${timeId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing available time:", error);
      throw error;
    }
  },

  // Delete available time slot (alias for removeAvailableTime)
  async deleteAvailableTime(timeId) {
    return this.removeAvailableTime(timeId);
  },

  // Book a time slot
  async bookTime(bookingData) {
    try {
      const response = await api.post("/booking/book", bookingData);
      return response.data;
    } catch (error) {
      console.error("Error booking time slot:", error);
      throw error;
    }
  },

  // Cancel a booking
  async cancelBooking(timeId) {
    try {
      const response = await api.delete(`/booking/cancel/${timeId}`);
      return response.data;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw error;
    }
  },
};

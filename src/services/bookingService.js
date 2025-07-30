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
      if (!shopId) {
        throw new Error("Shop ID is required");
      }

      console.log("Getting all shop times for shopId:", shopId);

      const response = await api.get(`/booking/available/${shopId}?includeBooked=true`);
      console.log("All times response:", response);

      return {
        success: true,
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error("Error fetching all shop times:", error);
      return { success: false, message: error.message };
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
      const response = await api.post("/booking/available-time", timeData);
      return response.data;
    } catch (error) {
      console.error("Error adding available time:", error);
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

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

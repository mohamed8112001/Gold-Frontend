import api from './api.js';

export const bookingService = {
  // Add available time (shop owner only)
  addAvailableTime: async (timeData) => {
    try {
      const response = await api.post('/booking', timeData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add available time');
    }
  },

  // Get available times for shop
  getAvailableTimesForShop: async (shopId, date = null) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get(`/booking/${shopId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch available times');
    }
  },

  // Book time
  bookTime: async (bookingData) => {
    try {
      const response = await api.post('/booking/book', bookingData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to book appointment');
    }
  },

  // Note: The following endpoints are not available in the backend yet
  // They would need to be implemented in the backend if needed

  // Get user bookings - NOT IMPLEMENTED IN BACKEND
  getUserBookings: async () => {
    try {
      // This endpoint doesn't exist in backend, would need to be added
      throw new Error('This feature is not yet implemented in the backend');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  },

  // Get shop bookings - NOT IMPLEMENTED IN BACKEND
  getShopBookings: async (shopId) => {
    try {
      // This endpoint doesn't exist in backend, would need to be added
      throw new Error('This feature is not yet implemented in the backend');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch shop bookings');
    }
  },

  // Update booking status - NOT IMPLEMENTED IN BACKEND
  updateBookingStatus: async (bookingId, status) => {
    try {
      // This endpoint doesn't exist in backend, would need to be added
      throw new Error('This feature is not yet implemented in the backend');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update booking status');
    }
  },

  // Cancel booking - NOT IMPLEMENTED IN BACKEND
  cancelBooking: async (bookingId) => {
    try {
      // This endpoint doesn't exist in backend, would need to be added
      throw new Error('This feature is not yet implemented in the backend');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  }
};


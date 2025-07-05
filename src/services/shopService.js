import api from './api.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const shopService = {
  // Get all shops (public - no authentication required)
  getAllShops: async (params = {}) => {
    try {
      const response = await api.get(API_ENDPOINTS.SHOP.GET_ALL_PUBLIC, { params });
      // Backend returns: { status: "success", result: number, data: shops[] }
      // We need to return the shops array
      if (response.data && response.data.status === 'success') {
        return response.data.data || [];
      }
      return response.data || [];
    } catch (error) {
      console.error('Error fetching shops:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch shops');
    }
  },

  // Get shop by ID (public - no authentication required)
  getShop: async (shopId) => {
    try {
      const response = await api.get(API_ENDPOINTS.SHOP.GET_BY_ID_PUBLIC(shopId));
      // Backend returns: { status: "success", data: shop }
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching shop details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch shop details');
    }
  },

  // Create new shop (shop owner only)
  createShop: async (shopData) => {
    try {
      const response = await api.post('/shop/create', shopData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create shop');
    }
  },

  // Update shop (shop owner only)
  updateShop: async (shopId, shopData) => {
    try {
      const response = await api.put(`/shop/${shopId}`, shopData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update shop');
    }
  },

  // Delete shop (shop owner only)
  deleteShop: async (shopId) => {
    try {
      const response = await api.delete(`/shop/${shopId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete shop');
    }
  },

  // Search shops
  searchShops: async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      const response = await api.get('/shop', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  }
};


import api from './api.js';

export const productService = {
  // Get all products
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/product', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  // Get product by ID
  getProduct: async (productId) => {
    try {
      const response = await api.get(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product details');
    }
  },

  // Create new product (shop owner only)
  createProduct: async (productData) => {
    try {
      const response = await api.post('/product/create', productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  // Update product (shop owner only)
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/product/${productId}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  // Delete product (shop owner only)
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  // Add to favorites
  addToFavorites: async (productId) => {
    try {
      const response = await api.post('/product/favorite', { productId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add to favorites');
    }
  },

  // Remove from favorites
  removeFromFavorites: async (productId) => {
    try {
      const response = await api.delete(`/product/favorite/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove from favorites');
    }
  },

  // Get user favorites
  getFavorites: async (userId) => {
    try {
      const response = await api.get(`/product/favorite/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch favorites');
    }
  }
};


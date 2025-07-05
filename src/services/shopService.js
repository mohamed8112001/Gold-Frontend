import api from "./api.js";

export const shopService = {
  // Get all shops
  getAllShops: async (params = {}) => {
    try {
      const response = await api.get("/shop", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch shops");
    }
  },

  // Get shop by ID
  getShop: async (shopId) => {
    try {
      const response = await api.get(`/shop/${shopId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch shop details"
      );
    }
  },

  // Create new shop (shop owner only)
  createShop: async (shopData) => {
    try {
      const response = await api.post("/shop/create", shopData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create shop");
    }
  },

  // Update shop (shop owner only)
  updateShop: async (shopId, shopData) => {
    try {
      const response = await api.put(`/shop/${shopId}`, shopData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update shop");
    }
  },

  // Delete shop (shop owner only)
  deleteShop: async (shopId) => {
    try {
      const response = await api.delete(`/shop/${shopId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete shop");
    }
  },

  // Search shops
  searchShops: async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      const response = await api.get("/shop", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Search failed");
    }
  },

  // Admin functions
  // Approve shop (admin only)
  approveShop: async (shopId) => {
    try {
      const response = await api.put(`/shop/${shopId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to approve shop"
      );
    }
  },

  // Reject shop (admin only)
  rejectShop: async (shopId) => {
    try {
      const response = await api.put(`/shop/${shopId}/reject`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to reject shop");
    }
  },

  // Get all shops including pending (admin only)
  getAllShopsAdmin: async (params = {}) => {
    try {
      const response = await api.get("/shop/admin/all", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch admin shops"
      );
    }
  },

  // Get pending shops (admin only)
  getPendingShops: async () => {
    try {
      const response = await api.get("/shop/admin/pending");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch pending shops"
      );
    }
  },
<<<<<<< HEAD
};
=======
};
>>>>>>> 85f67a2d071b5831fabbe48782b6a10de32d8cbc

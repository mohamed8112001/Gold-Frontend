import api from "./api.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const shopService = {
  // Get all shops (authenticated - role-based filtering)
  getAllShops: async (params = {}) => {
    try {
      const response = await api.get("/shop", { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch shops");
    }
  },

  // Get public shops (no authentication required - only approved shops)
  getPublicShops: async (params = {}) => {
    try {
      const response = await api.get("/shop/public", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch public shops"
      );
    }
  },

  // Get shop by ID (authenticated)
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

  // Get public shop by ID (no authentication required - only approved shops)
  getPublicShop: async (shopId) => {
    try {
      const response = await api.get(`/shop/public/${shopId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch public shop details"
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
      console.log("=== SHOP SERVICE APPROVE ===");
      console.log("Shop ID:", shopId);
      console.log("API URL:", `/shop/${shopId}/approve`);
      console.log(
        "Token from localStorage:",
        localStorage.getItem(STORAGE_KEYS.TOKEN)
      );

      const response = await api.patch(`/shop/${shopId}/approve`);
      console.log("API Response:", response);
      console.log("Response data:", response.data);

      return response.data;
    } catch (error) {
      console.error("=== SHOP SERVICE ERROR ===");
      console.error("Error:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
      console.error("Error request:", error.request);
      console.error("Error config:", error.config);
      console.error("Error message:", error.message);

      // More detailed error message
      let errorMessage = "Failed to approve shop";

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          errorMessage = "غير مصرح لك بالوصول - يرجى تسجيل الدخول مرة أخرى";
        } else if (status === 403) {
          errorMessage = "ليس لديك صلاحية للموافقة على المتاجر";
        } else if (status === 404) {
          errorMessage = "المتجر غير موجود";
        } else if (status === 500) {
          errorMessage = "خطأ في الخادم";
        } else {
          errorMessage = data?.message || `خطأ HTTP ${status}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "خطأ في الاتصال بالخادم";
      } else {
        // Other error
        errorMessage = error.message || "خطأ غير معروف";
      }

      throw new Error(errorMessage);
    }
  },

  // Reject shop (admin only)
  rejectShop: async (shopId) => {
    try {
      const response = await api.patch(`/shop/${shopId}/reject`);
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
  // Get current user's shop
  getMyShop: async () => {
    try {
      const response = await api.get("/shop/my-shop");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user shop"
      );
    }
  },
};

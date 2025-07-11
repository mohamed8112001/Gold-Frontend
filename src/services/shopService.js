import api from "./api.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const shopService = {
  /**
   * Get all shops with optional filters
   * @param {Object} [params={}] - Filter parameters
   * @param {string} [params.location] - Location filter
   * @param {number|string} [params.rating] - Minimum rating
   * @param {Array<string>|string} [params.specialties] - Shop specialties
   * @param {string} [params.sortBy] - Sorting criteria
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Items per page
   * @param {AbortSignal} [signal] - Optional abort controller signal
   * @returns {Promise<{success: boolean, data?: any, message?: string, meta?: Object}>}
   */
  getAllShops: async function(params = {}, signal = null) {
    try {
      // Clean and normalize parameters
      const cleanParams = {
        // Convert rating to number if exists
        ...(params.rating && { rating: Number(params.rating) }),
        // Convert specialties array to string if needed
        ...(params.specialties && { 
          specialties: Array.isArray(params.specialties) 
            ? params.specialties.join(',') 
            : params.specialties 
        }),
        // Copy other params
        ...params
      };
      
      // Remove undefined values
      Object.keys(cleanParams).forEach(key => 
        cleanParams[key] === undefined && delete cleanParams[key]
      );

      const config = {
        params: cleanParams,
        ...(signal && { signal })
      };

      const response = await api.get('/shop', config);

      return {
        success: true,
        data: response.data.data,
        meta: {
          total: response.data.results,
          page: params.page || 1,
          limit: params.limit || response.data.data.length
        }
      };
    } catch (error) {
      // Handle abort errors differently
      if (error.name === 'AbortError') {
        return { 
          success: false, 
          message: 'Request cancelled',
          isAborted: true
        };
      }

      // Extract error message from different possible locations
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to fetch shops';

      return {
        success: false,
        message: errorMessage,
        status: error.response?.status,
        error: error
      };
    }
  },

  // Simple caching mechanism (5 minute cache)
  _shopCache: {
    data: null,
    timestamp: 0,
    paramsKey: ''
  },

  /**
   * Get shops with basic caching
   * @param {Object} params - Same as getAllShops
   * @returns {Promise} Cached or fresh data
   */
  getShopsCached: async function(params = {}) {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    const paramsKey = JSON.stringify(params);

    // Return cached data if available and fresh
    if (this._shopCache.data && 
        this._shopCache.paramsKey === paramsKey &&
        (now - this._shopCache.timestamp) < CACHE_DURATION) {
      return this._shopCache.data;
    }

    // Otherwise fetch fresh data
    const result = await this.getAllShops(params);
    
    // Only cache successful responses
    if (result.success) {
      this._shopCache = {
        data: result,
        timestamp: now,
        paramsKey: paramsKey
      };
    }

    return result;
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
      const response = await api.post(`/shop/create`, shopData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.log(error);
      
      throw new Error(JSON.stringify(error));
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

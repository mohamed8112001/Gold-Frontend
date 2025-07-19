import api from "./api.js";

export const rateService = {
  // Create rate for shop
  createRate: async (shopId, rateData) => {
    try {
      const response = await api.post(`/rate/${shopId}`, rateData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create rating"
      );
    }
  },

  // Get all rates
  getAllRates: async (params = {}) => {
    try {
      console.log("Getting rates with params:", params);

      const { shopId, ...otherParams } = params;
      let endpoint = "/rate";

      if (shopId) {
        // Validate shopId if provided
        if (typeof shopId !== "string" || shopId.length < 3) {
          console.error("Invalid shop ID format:", shopId);
          throw new Error("Invalid shop ID format");
        }
        endpoint = `/rate/shop/${shopId}`;
      }

      const response = await api.get(endpoint, {
        params: otherParams,
      });
      console.log("Rates API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in getAllRates:", error);

      // Handle different error types gracefully
      if (error.response?.status === 400) {
        console.warn(
          "Bad request for rates (likely invalid shopId), returning empty array"
        );
        return { data: [] }; // Return consistent structure
      } else if (error.response?.status === 404) {
        console.warn("No rates found for this shop, returning empty array");
        return { data: [] };
      } else if (error.response?.status >= 500) {
        console.warn("Server error for rates, returning empty array");
        return { data: [] };
      }

      throw new Error(
        error.response?.data?.message || "Failed to fetch ratings"
      );
    }
  },

  // Get rate by ID
  getRate: async (rateId) => {
    try {
      const response = await api.get(`/rate/${rateId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch rating"
      );
    }
  },

  // Update rate
  updateRate: async (rateId, rateData) => {
    try {
      const response = await api.put(`/rate/${rateId}`, rateData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update rating"
      );
    }
  },

  // Delete rate
  deleteRate: async (rateId) => {
    try {
      const response = await api.delete(`/rate/${rateId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete rating"
      );
    }
  },

  // Get shop ratings - NOT IMPLEMENTED IN BACKEND
  getShopRatings: async (shopId, params = {}) => {
    try {
      // This endpoint doesn't exist in backend, would need to be added
      // For now, we can use getAllRates and filter by shopId on frontend
      const response = await api.get("/rate", {
        params: { shopId, ...params },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch shop ratings"
      );
    }
  },

  // Get user ratings - NOT IMPLEMENTED IN BACKEND
  getUserRatings: async (userId) => {
    try {
      // This endpoint doesn't exist in backend, would need to be added
      // For now, we can use getAllRates and filter by userId on frontend
      const response = await api.get("/rate", { params: { userId } });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user ratings"
      );
    }
  },
};

import api from "./api.js";

export const productService = {
  // Get all products
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get("/product", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  },

  // Get products by shop ID
  getProductsByShop: async (shopId, params = {}) => {
    try {
      const response = await api.get(`/product/shop/${shopId}`, {
        params: params,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch shop products"
      );
    }
  },

  // Get product by ID
  getProduct: async (productId) => {
    try {
      const response = await api.get(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch product details"
      );
    }
  },

  // Create new product (shop owner only)
  createProduct: async (productData) => {
    try {
      const response = await api.post(`/product/create`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create product"
      );
    }
  },

  // Update product (shop owner only)
  updateProduct: async (productId, productData) => {
    try {
      console.log("🔄 Updating product:", productId);
      console.log("📦 Data type: FormData");

      const response = await api.put(`/product/${productId}`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Don't set Content-Type, let browser set it automatically for FormData
        },
      });

      console.log("✅ Product update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Update product error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          `Server error (${error.response?.status || "Unknown"})`
      );
    }
  },

  // Delete product (shop owner only)
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/product/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  },

  // Add to favorites
  addToFavorites: async (productId) => {
    try {
      const response = await api.post(`/product/favorite/${productId}`);
      console.log(`success add to fav: ${JSON.stringify(response.data)}`);

      return response.data;
    } catch (error) {
      console.log(`error: ${error.response?.data?.message}`);

      throw new Error(
        error.response?.data?.message || "Failed to add to favorites"
      );
    }
  },

  // Remove from favorites
  removeFromFavorites: async (productId) => {
    try {
      const response = await api.delete(`/product/favorite/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to remove from favorites"
      );
    }
  },

  // Get user favorites
  getFavorites: async (userId) => {
    try {
      const response = await api.get(`/product/favorite/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch favorites"
      );
    }
  },
};

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
  getAllShops: async function (params = {}, signal = null) {
    try {
      // Clean and normalize parameters
      const cleanParams = {
        // Convert rating to number if exists
        ...(params.rating && { rating: Number(params.rating) }),
        // Convert specialties array to string if needed
        ...(params.specialties && {
          specialties: Array.isArray(params.specialties)
            ? params.specialties.join(",")
            : params.specialties,
        }),
        // Copy other params
        ...params,
      };

      // Remove undefined values
      Object.keys(cleanParams).forEach(
        (key) => cleanParams[key] === undefined && delete cleanParams[key]
      );

      const config = {
        params: cleanParams,
        ...(signal && { signal }),
      };

      // Try authenticated endpoint first, fallback to public endpoint
      let response;
      try {
        response = await api.get("/shop", config);
        console.log("Shop API Response (authenticated):", response.data);
      } catch (authError) {
        // If authentication fails (401/403), try public endpoint
        if (authError.response?.status === 401 || authError.response?.status === 403) {
          console.log("Authentication failed, trying public endpoint...");
          response = await api.get("/shop/public", config);
          console.log("Shop API Response (public):", response.data);
        } else {
          throw authError;
        }
      }

      return {
        success: true,
        data: response.data.data,
        meta: {
          total: response.data.results || response.data.result,
          page: params.page || 1,
          limit: params.limit || response.data.data.length,
        },
      };
    } catch (error) {
      // Handle abort errors differently
      if (error.name === "AbortError") {
        return {
          success: false,
          message: "Request cancelled",
          isAborted: true,
        };
      }

      // Extract error message from different possible locations
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch shops";

      return {
        success: false,
        message: errorMessage,
        status: error.response?.status,
        error: error,
      };
    }
  },

  // Simple caching mechanism (5 minute cache)
  _shopCache: {
    data: null,
    timestamp: 0,
    paramsKey: "",
  },

  /**
   * Get shops with basic caching
   * @param {Object} params - Same as getAllShops
   * @returns {Promise} Cached or fresh data
   */
  getShopsCached: async function (params = {}) {
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    const paramsKey = JSON.stringify(params);

    // Return cached data if available and fresh
    if (
      this._shopCache.data &&
      this._shopCache.paramsKey === paramsKey &&
      now - this._shopCache.timestamp < CACHE_DURATION
    ) {
      return this._shopCache.data;
    }

    // Otherwise fetch fresh data
    const result = await this.getAllShops(params);

    // Only cache successful responses
    if (result.success) {
      this._shopCache = {
        data: result,
        timestamp: now,
        paramsKey: paramsKey,
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

  // Alias for getShop
  getShopById: async (shopId) => {
    return shopService.getShop(shopId);
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
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
      // Check if shopData is FormData (contains files) or regular object
      const isFormData = shopData instanceof FormData;

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      // If it's FormData, set multipart content type
      if (isFormData) {
        config.headers["Content-Type"] = "multipart/form-data";
      }

      const response = await api.put(`/shop/${shopId}`, shopData, config);
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
      // Use the regular shop endpoint since the admin can see all shops
      const response = await api.get("/shop", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching admin shops:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch admin shops"
      );
    }
  },

  // Mark shop as paid (shop owner only)
  payForShop: async (shopId) => {
    try {
      const response = await api.patch(`/shop/${shopId}/pay`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to process payment"
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
      const response = await api.get("/shop");
      // إرجاع أول متجر للمستخدم (معظم المستخدمين لديهم متجر واحد)
      if (response.data && response.data.data && response.data.data.length > 0) {
        return {
          success: true,
          data: response.data.data[0]
        };
      } else {
        throw new Error("No shop found for current user");
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user shop"
      );
    }
  },

  // Upload gallery images - simplified approach
  uploadGalleryImages: async (shopId, formData) => {
    try {
      console.log("📤 Uploading gallery images for shop:", shopId);

      // Log FormData contents for debugging
      console.log("� FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: ${value.name} (${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Use shop update endpoint to add gallery images
      const response = await api.put(`/shop/${shopId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("📥 Upload response:", response);

      // Return success with uploaded file names
      return {
        success: true,
        data: response.data,
        images: response.data?.files || response.data?.images || [],
      };
    } catch (error) {
      console.error("❌ Gallery upload error (PUT /shop/:id):", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error message:", error.response?.data?.message);

      // Try alternative endpoints for real upload
      console.log("🔄 Trying alternative endpoints for real upload...");

      try {
        // Try shop update with PATCH method
        console.log("🔄 Trying PATCH /shop/:id for gallery update");

        const response = await api.patch(`/shop/${shopId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("✅ Success with PATCH /shop/:id");
        return {
          success: true,
          data: response.data,
          images:
            response.data?.shop?.gallery ||
            response.data?.gallery ||
            response.data?.images ||
            response.data?.files ||
            [],
          message: "تم رفع الصور بنجاح وحفظها في قاعدة البيانات",
        };
      } catch (altError) {
        console.log(
          "❌ PATCH /shop/:id also failed:",
          altError.response?.status
        );

        // Try one more endpoint - shop image upload
        try {
          console.log("🔄 Trying POST /shop/upload-images");

          const imageResponse = await api.post(
            "/shop/upload-images",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              params: {
                shopId: shopId,
                type: "gallery",
              },
            }
          );

          console.log("✅ Success with /shop/upload-images");
          return {
            success: true,
            data: imageResponse.data,
            images:
              imageResponse.data?.images || imageResponse.data?.files || [],
            message: "تم رفع الصور بنجاح وحفظها في قاعدة البيانات",
          };
        } catch (finalError) {
          console.log("❌ All endpoints failed");

          // Final fallback - save to localStorage
          console.log("🔄 Using localStorage fallback for gallery images");

          try {
            const savedImages = [];
            const existingGallery = JSON.parse(
              localStorage.getItem(`shop_gallery_${shopId}`) || "[]"
            );

            // Convert files to base64 and save (avoid duplicates)
            const processedFiles = new Set();
            for (let [key, value] of formData.entries()) {
              if (value instanceof File && key === "gallery") {
                // Create a unique identifier for the file to avoid duplicates
                const fileId = `${value.name}_${value.size}_${value.lastModified}`;

                if (!processedFiles.has(fileId)) {
                  processedFiles.add(fileId);

                  const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(value);
                  });

                  const imageData = {
                    id: `local_${Date.now()}_${Math.random()
                      .toString(36)
                      .substring(2, 11)}`,
                    name: value.name,
                    data: base64,
                    size: value.size,
                    type: value.type,
                    uploadDate: new Date().toISOString(),
                  };

                  savedImages.push(imageData);
                }
              }
            }

            // Save to localStorage
            const updatedGallery = [...existingGallery, ...savedImages];
            localStorage.setItem(
              `shop_gallery_${shopId}`,
              JSON.stringify(updatedGallery)
            );

            console.log(
              `💾 Saved ${savedImages.length} images to localStorage for shop ${shopId}`
            );

            return {
              success: true,
              data: {
                images: savedImages,
                gallery: updatedGallery,
              },
              images: savedImages.map((img) => img.id),
              message: `تم حفظ ${savedImages.length} صورة محلياً (مؤقت - في انتظار دعم Backend)`,
            };
          } catch (localStorageError) {
            console.error(
              "❌ localStorage fallback also failed:",
              localStorageError
            );
            throw new Error("فشل في رفع الصور حتى مع الحفظ المحلي");
          }
        }
      }
    }
  },

  // Get gallery images from localStorage
  getShopGallery: async (shopId) => {
    try {
      const gallery = JSON.parse(
        localStorage.getItem(`shop_gallery_${shopId}`) || "[]"
      );

      // Remove duplicates based on name and size
      const uniqueGallery = [];
      const seen = new Set();

      gallery.forEach((image) => {
        const key = `${image.name}_${image.size}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueGallery.push(image);
        }
      });

      // If we removed duplicates, save the cleaned version
      if (uniqueGallery.length !== gallery.length) {
        localStorage.setItem(
          `shop_gallery_${shopId}`,
          JSON.stringify(uniqueGallery)
        );
        console.log(
          `🧹 Cleaned ${
            gallery.length - uniqueGallery.length
          } duplicate images for shop ${shopId}`
        );
      }

      console.log(
        `📁 Retrieved ${uniqueGallery.length} unique images from localStorage for shop ${shopId}`
      );
      return {
        success: true,
        data: uniqueGallery,
        images: uniqueGallery,
      };
    } catch (error) {
      console.error("Error getting shop gallery:", error);
      return {
        success: true,
        data: [],
        images: [],
      };
    }
  },

  // Delete gallery image
  deleteGalleryImage: async (shopId, imageName) => {
    try {
      // Try backend delete first
      const response = await api.delete(`/shop/${shopId}/gallery/${imageName}`);
      return response.data;
    } catch (error) {
      // Fallback: delete from localStorage
      try {
        const gallery = JSON.parse(
          localStorage.getItem(`shop_gallery_${shopId}`) || "[]"
        );
        const updatedGallery = gallery.filter((img) => img.id !== imageName);
        localStorage.setItem(
          `shop_gallery_${shopId}`,
          JSON.stringify(updatedGallery)
        );
        console.log(`🗑️ Deleted image ${imageName} from localStorage`);
        return { success: true };
      } catch (localError) {
        throw new Error("Failed to delete gallery image");
      }
    }
  },

  // Get commercial record PDF URL (admin only)
  getCommercialRecordUrl: (shopId) => {
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5006";
    return `${baseURL}/shop/${shopId}/commercial-record`;
  },

  // طريقة محسنة لعرض السجل التجاري مع إدارة أفضل للأخطاء
  viewCommercialRecordEnhanced: async (shopId) => {
    try {
      console.log("🔍 Starting enhanced commercial record view for shop:", shopId);

      // التحقق من الـ token أولاً
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // محاولة الحصول على الملف كـ blob أولاً
      const response = await api.get(`/shop/${shopId}/commercial-record`, {
        responseType: "blob",
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("📥 Response received:", {
        status: response.status,
        contentType: response.headers['content-type'],
        size: response.data.size
      });

      // التحقق من نوع المحتوى
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/pdf')) {
        // إنشاء URL للـ blob
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        // محاولة فتح الملف في تبويب جديد
        const newWindow = window.open(url, "_blank");

        if (newWindow) {
          console.log("✅ PDF opened successfully in new tab");
          // تنظيف الـ URL بعد فترة
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 10000);
          return { success: true, method: "blob" };
        } else {
          // إذا فشل فتح النافذة، محاولة التحميل
          console.log("⚠️ Popup blocked, trying download");
          const link = document.createElement('a');
          link.href = url;
          link.download = `commercial-record-${shopId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 5000);

          return { success: true, method: "download" };
        }
      } else {
        throw new Error("Invalid content type received");
      }
    } catch (error) {
      console.error("❌ Enhanced method failed:", error);
      throw error;
    }
  },

  // Download commercial record PDF (admin only)
  downloadCommercialRecord: async (shopId) => {
    try {
      console.log("📤 Downloading PDF for shop:", shopId);
      const response = await api.get(`/shop/${shopId}/commercial-record`, {
        responseType: "blob", // مهم للـ PDF
        timeout: 30000, // 30 seconds timeout
      });

      console.log("📥 PDF response received:", response.status);

      // التحقق من نوع المحتوى
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/pdf')) {
        console.warn("⚠️ Response is not a PDF, trying fallback method");
        throw new Error("Invalid content type received");
      }

      // إنشاء URL للـ blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // فتح الـ PDF في تبويب جديد
      const newWindow = window.open(url, "_blank");

      // التحقق من نجاح فتح النافذة
      if (!newWindow) {
        console.warn("⚠️ Popup blocked, trying download instead");
        // إنشاء رابط تحميل
        const link = document.createElement('a');
        link.href = url;
        link.download = `commercial-record-${shopId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // تنظيف الـ URL بعد فترة
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 5000);

      return { success: true };
    } catch (error) {
      console.error("❌ PDF download error:", error);

      // محاولة الطريقة البديلة - فتح الرابط مباشرة
      if (error.response?.status !== 404) {
        console.log("🔄 Trying fallback method - direct URL");
        try {
          const fallbackUrl = `${import.meta.env.VITE_API_BASE_URL}/shop/${shopId}/commercial-record`;
          const newWindow = window.open(fallbackUrl, "_blank");

          if (!newWindow) {
            throw new Error("Popup blocked and fallback failed");
          }

          console.log("✅ Fallback method successful");
          return { success: true, method: "fallback" };
        } catch (fallbackError) {
          console.error("❌ Fallback method also failed:", fallbackError);
        }
      }

      // رمي الخطأ الأصلي مع معلومات إضافية
      const enhancedError = new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to download commercial record"
      );
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;

      throw enhancedError;
    }
  },

  // طريقة بديلة لعرض السجل التجاري باستخدام الرابط المباشر
  viewCommercialRecordDirect: (shopId) => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5006";
      const directUrl = `${baseURL}/shop/${shopId}/commercial-record`;

      console.log("🔗 Opening commercial record directly:", directUrl);

      const newWindow = window.open(directUrl, "_blank");

      if (!newWindow) {
        throw new Error("Popup blocked - please allow popups for this site");
      }

      return { success: true, url: directUrl };
    } catch (error) {
      console.error("❌ Error opening commercial record directly:", error);
      throw error;
    }
  },

  // طلب تفعيل المتجر
  requestShopActivation: async (shopId) => {
    try {
      const response = await api.patch(`/shop/${shopId}/request-activation`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to request shop activation"
      );
    }
  },

  // موافقة الأدمن على طلب تفعيل المتجر
  approveShopActivation: async (shopId) => {
    try {
      const response = await api.patch(`/shop/${shopId}/approve-activation`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to approve shop activation"
      );
    }
  },

  // رفض الأدمن لطلب تفعيل المتجر
  rejectShopActivation: async (shopId, reason) => {
    try {
      const response = await api.patch(`/shop/${shopId}/reject-activation`, {
        reason: reason
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to reject shop activation"
      );
    }
  },

  // الحصول على طلبات التفعيل المعلقة (للأدمن)
  getPendingActivations: async () => {
    try {
      const response = await api.get("/shop/admin/pending-activations");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch pending activations"
      );
    }
  },

  // QR Code functions
  generateQRCode: async (shopId) => {
    try {
      const response = await api.post(`/shop/${shopId}/qr-code/generate`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to generate QR code"
      );
    }
  },

  getQRCode: async (shopId) => {
    try {
      const response = await api.get(`/shop/${shopId}/qr-code`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch QR code"
      );
    }
  },
};

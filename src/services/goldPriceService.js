import { apiRequest, handleApiError } from './api.js';
import { API_ENDPOINTS } from '../utils/constants.js';

/**
 * Gold Price Service
 * Handles fetching gold prices for different karats (18, 21, 24)
 */
export const goldPriceService = {
  /**
   * Get gold price for 18 karat
   * @returns {Promise<Object>} Price data for 18k gold
   */
  getPrice18k: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.PRICE.GRAM_18);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching 18k gold price:', error);
      return {
        success: false,
        message: handleApiError(error),
        error: error,
      };
    }
  },

  /**
   * Get gold price for 21 karat
   * @returns {Promise<Object>} Price data for 21k gold
   */
  getPrice21k: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.PRICE.GRAM_21);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching 21k gold price:', error);
      return {
        success: false,
        message: handleApiError(error),
        error: error,
      };
    }
  },

  /**
   * Get gold price for 24 karat
   * @returns {Promise<Object>} Price data for 24k gold
   */
  getPrice24k: async () => {
    try {
      const response = await apiRequest.get(API_ENDPOINTS.PRICE.GRAM_24);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching 24k gold price:', error);
      return {
        success: false,
        message: handleApiError(error),
        error: error,
      };
    }
  },

  /**
   * Get all gold prices (18k, 21k, 24k) in parallel
   * @returns {Promise<Object>} All price data
   */
  getAllPrices: async () => {
    try {
      const [price18k, price21k, price24k] = await Promise.allSettled([
        goldPriceService.getPrice18k(),
        goldPriceService.getPrice21k(),
        goldPriceService.getPrice24k(),
      ]);

      const result = {
        success: true,
        data: {},
        errors: [],
      };

      // Process 18k result
      if (price18k.status === 'fulfilled' && price18k.value.success) {
        result.data.karat18 = price18k.value.data;
      } else {
        result.errors.push({
          karat: '18k',
          error: price18k.value?.message || 'Failed to fetch 18k price',
        });
      }

      // Process 21k result
      if (price21k.status === 'fulfilled' && price21k.value.success) {
        result.data.karat21 = price21k.value.data;
      } else {
        result.errors.push({
          karat: '21k',
          error: price21k.value?.message || 'Failed to fetch 21k price',
        });
      }

      // Process 24k result
      if (price24k.status === 'fulfilled' && price24k.value.success) {
        result.data.karat24 = price24k.value.data;
      } else {
        result.errors.push({
          karat: '24k',
          error: price24k.value?.message || 'Failed to fetch 24k price',
        });
      }

      // If all requests failed, mark as unsuccessful
      if (Object.keys(result.data).length === 0) {
        result.success = false;
        result.message = 'Failed to fetch any gold prices';
      }

      return result;
    } catch (error) {
      console.error('Error fetching all gold prices:', error);
      return {
        success: false,
        message: handleApiError(error),
        error: error,
      };
    }
  },

  /**
   * Calculate product price
   * @param {Object} productData - Product data (karat, weight, makingCharges)
   * @returns {Promise<Object>} Calculated price data
   */
  calculateProductPrice: async (productData) => {
    try {
      const response = await apiRequest.post(
        API_ENDPOINTS.PRICE.CALCULATE_PRODUCT,
        productData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error calculating product price:', error);
      return {
        success: false,
        message: handleApiError(error),
        error: error,
      };
    }
  },

  /**
   * Format price for display
   * @param {number|string} price - Price value
   * @returns {string} Formatted price
   */
  formatPrice: (price) => {
    if (!price) return '---';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ar-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(numPrice));
  },

  /**
   * Get formatted prices for display
   * @returns {Promise<Object>} Formatted price data for display
   */
  getFormattedPrices: async () => {
    try {
      const result = await goldPriceService.getAllPrices();
      
      if (!result.success) {
        return {
          success: false,
          message: result.message,
          data: {
            karat18: '---',
            karat21: '---',
            karat24: '---',
          },
        };
      }

      const formattedData = {
        karat18: result.data.karat18 
          ? goldPriceService.formatPrice(result.data.karat18.price_per_gram_egp)
          : '---',
        karat21: result.data.karat21 
          ? goldPriceService.formatPrice(result.data.karat21.price_per_gram_egp)
          : '---',
        karat24: result.data.karat24 
          ? goldPriceService.formatPrice(result.data.karat24.price_per_gram_egp)
          : '---',
      };

      return {
        success: true,
        data: formattedData,
        errors: result.errors || [],
      };
    } catch (error) {
      console.error('Error getting formatted prices:', error);
      return {
        success: false,
        message: handleApiError(error),
        data: {
          karat18: '---',
          karat21: '---',
          karat24: '---',
        },
      };
    }
  },
};

export default goldPriceService;

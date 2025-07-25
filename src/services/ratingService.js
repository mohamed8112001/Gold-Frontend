import api from './api';

export const ratingService = {
  /**
   * Rate a product (create or update rating)
   * @param {string} productId - Product ID
   * @param {Object} ratingData - Rating data {rating, comment}
   * @returns {Promise} API response
   */
  rateProduct: async (productId, ratingData) => {
    try {
      console.log('⭐ Rating product:', productId, ratingData);
      
      const response = await api.post(`/product/${productId}/rate`, ratingData);
      
      console.log('✅ Product rated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error rating product:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to rate product'
      );
    }
  },

  /**
   * Get all ratings for a product
   * @param {string} productId - Product ID
   * @param {Object} options - Query options {page, limit, sort}
   * @returns {Promise} API response
   */
  getProductRatings: async (productId, options = {}) => {
    try {
      console.log('📊 Getting product ratings:', productId, options);
      
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.sort) params.append('sort', options.sort);
      
      const response = await api.get(`/product/${productId}/ratings?${params}`);
      
      console.log('✅ Product ratings retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting product ratings:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get product ratings'
      );
    }
  },

  /**
   * Get current user's rating for a product
   * @param {string} productId - Product ID
   * @returns {Promise} API response
   */
  getUserRating: async (productId) => {
    try {
      console.log('👤 Getting user rating for product:', productId);
      
      const response = await api.get(`/product/${productId}/my-rating`);
      
      console.log('✅ User rating retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting user rating:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get user rating'
      );
    }
  },

  /**
   * Delete user's rating for a product
   * @param {string} productId - Product ID
   * @returns {Promise} API response
   */
  deleteRating: async (productId) => {
    try {
      console.log('🗑️ Deleting rating for product:', productId);
      
      const response = await api.delete(`/product/${productId}/rate`);
      
      console.log('✅ Rating deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting rating:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to delete rating'
      );
    }
  },

  /**
   * Get rating statistics for a product
   * @param {string} productId - Product ID
   * @returns {Promise} API response
   */
  getRatingStats: async (productId) => {
    try {
      console.log('📈 Getting rating stats for product:', productId);
      
      const response = await api.get(`/product/${productId}/rating-stats`);
      
      console.log('✅ Rating stats retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting rating stats:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get rating stats'
      );
    }
  },

  /**
   * Format rating display
   * @param {number} rating - Rating value
   * @returns {string} Formatted rating
   */
  formatRating: (rating) => {
    return Number(rating).toFixed(1);
  },

  /**
   * Get rating text description
   * @param {number} rating - Rating value
   * @returns {string} Rating description
   */
  getRatingText: (rating) => {
    const ratingTexts = {
      1: 'ضعيف جداً',
      2: 'ضعيف',
      3: 'متوسط',
      4: 'جيد',
      5: 'ممتاز'
    };
    return ratingTexts[Math.round(rating)] || 'غير محدد';
  },

  /**
   * Get rating color based on value
   * @param {number} rating - Rating value
   * @returns {string} CSS color class
   */
  getRatingColor: (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  },

  /**
   * Calculate rating percentage
   * @param {number} rating - Rating value
   * @returns {number} Percentage (0-100)
   */
  getRatingPercentage: (rating) => {
    return (rating / 5) * 100;
  },

  /**
   * Validate rating data
   * @param {Object} ratingData - Rating data to validate
   * @returns {Object} Validation result
   */
  validateRating: (ratingData) => {
    const errors = [];

    if (!ratingData.rating) {
      errors.push('التقييم مطلوب');
    } else if (ratingData.rating < 1 || ratingData.rating > 5) {
      errors.push('التقييم يجب أن يكون بين 1 و 5');
    } else if (!Number.isInteger(ratingData.rating)) {
      errors.push('التقييم يجب أن يكون رقم صحيح');
    }

    if (ratingData.comment && ratingData.comment.length > 500) {
      errors.push('التعليق لا يمكن أن يتجاوز 500 حرف');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Sort ratings by different criteria
   * @param {Array} ratings - Array of ratings
   * @param {string} sortBy - Sort criteria (newest, oldest, highest, lowest)
   * @returns {Array} Sorted ratings
   */
  sortRatings: (ratings, sortBy = 'newest') => {
    const sortedRatings = [...ratings];

    switch (sortBy) {
      case 'oldest':
        return sortedRatings.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return sortedRatings.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
      case 'lowest':
        return sortedRatings.sort((a, b) => a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt));
      case 'newest':
      default:
        return sortedRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  /**
   * Filter ratings by rating value
   * @param {Array} ratings - Array of ratings
   * @param {number} filterRating - Rating to filter by (1-5, or 0 for all)
   * @returns {Array} Filtered ratings
   */
  filterRatings: (ratings, filterRating = 0) => {
    if (filterRating === 0) return ratings;
    return ratings.filter(rating => rating.rating === filterRating);
  },

  /**
   * Get rating summary statistics
   * @param {Array} ratings - Array of ratings
   * @returns {Object} Rating statistics
   */
  calculateStats: (ratings) => {
    if (!ratings || ratings.length === 0) {
      return {
        total: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const total = ratings.length;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    const average = sum / total;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      distribution[rating.rating]++;
    });

    return {
      total,
      average: Math.round(average * 10) / 10,
      distribution
    };
  }
};

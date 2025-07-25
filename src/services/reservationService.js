import api from "./api.js";

export const reservationService = {
  // إنشاء حجز جديد بدفع 10%
  createReservation: async (productId, paymentMethodId) => {
    try {
      const response = await api.post("/simple-reservations", {
        productId,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create reservation"
      );
    }
  },

  // معالجة الدفع للحجز
  processPayment: async (reservationData) => {
    try {
      const response = await api.post("/simple-reservations/process-payment", reservationData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to process payment"
      );
    }
  },

  // التحقق من حالة الدفع وإنشاء الحجز إذا لم يكن موجوداً (يتطلب authentication)
  verifyPaymentAndCreateReservation: async (data) => {
    try {
      const response = await api.post("/auth/verify-reservation-payment", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to verify payment and create reservation"
      );
    }
  },

  // التحقق من حالة الدفع وإنشاء الحجز بدون authentication (للاستخدام بعد العودة من Stripe)
  verifyPaymentAndCreateReservationPublic: async (data) => {
    try {
      const response = await api.post("/auth/verify-reservation-payment-public", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to verify payment and create reservation"
      );
    }
  },

  // الحصول على جميع حجوزات المستخدم
  getUserReservations: async (params = {}) => {
    try {
      const response = await api.get("/simple-reservations", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch user reservations"
      );
    }
  },

  // تأكيد الحجز ودفع المبلغ المتبقي
  confirmReservation: async (reservationId, paymentData) => {
    try {
      const response = await api.post(`/simple-reservations/${reservationId}/confirm`, paymentData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to confirm reservation"
      );
    }
  },

  // إلغاء حجز
  cancelReservation: async (reservationId, reason) => {
    try {
      const response = await api.delete(`/simple-reservations/${reservationId}`, {
        data: { reason }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to cancel reservation"
      );
    }
  },

  // الحصول على تفاصيل حجز معين
  getReservationDetails: async (reservationId) => {
    try {
      const response = await api.get(`/simple-reservations/${reservationId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch reservation details"
      );
    }
  },

  // عرض حجوزات محل معين (للمحل فقط)
  getShopReservations: async (shopId, params = {}) => {
    try {
      const response = await api.get(`/simple-reservations/shop/${shopId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch shop reservations"
      );
    }
  },

  // تحديث حالة الحجز (من قبل المحل)
  updateReservationStatus: async (reservationId, status, notes) => {
    try {
      const response = await api.patch(`/simple-reservations/${reservationId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to update reservation status"
      );
    }
  },

  // حساب مبلغ الحجز (10% من السعر)
  calculateReservationAmount: (productPrice) => {
    const totalAmount = parseFloat(productPrice) || 0;
    const reservationAmount = totalAmount * 0.10;
    const remainingAmount = totalAmount - reservationAmount;
    
    return {
      totalAmount: totalAmount.toFixed(2),
      reservationAmount: reservationAmount.toFixed(2),
      remainingAmount: remainingAmount.toFixed(2),
      reservationPercentage: 10
    };
  }
};

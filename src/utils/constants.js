// API Base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5010";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    GOOGLE: "/auth/google",
    GOOGLE_CALLBACK: "/auth/google/callback",
    GOOGLE_FAILURE: "/auth/google/failure",
  },

  // Shop endpoints
  SHOP: {
    CREATE: "/shop/create",
    GET_ALL: "/shop",
    GET_ALL_PUBLIC: "/shop/public", // Public endpoint for browsing shops
    GET_BY_ID: (id) => `/shop/${id}`,
    GET_BY_ID_PUBLIC: (id) => `/shop/public/${id}`, // Public endpoint for shop details
    UPDATE: (id) => `/shop/${id}`,
    DELETE: (id) => `/shop/${id}`,
  },

  // Product endpoints
  PRODUCT: {
    CREATE: "/product/create",
    GET_ALL: "/product",
    GET_BY_ID: (id) => `/product/${id}`,
    UPDATE: (id) => `/product/${id}`,
    DELETE: (id) => `/product/${id}`,
    ADD_FAVORITE: "/product/favorite",
    GET_FAVORITES: (id) => `/product/favorite/${id}`,
    REMOVE_FAVORITE: (id) => `/product/favorite/${id}`,
  },

  // Booking endpoints
  BOOKING: {
    ADD_TIME: "/booking",
    GET_TIMES: (shopId) => `/booking/${shopId}`,
    BOOK: "/booking/book",
  },

  // Rate endpoints
  RATE: {
    CREATE: (shopId) => `/rate/${shopId}`,
    GET_ALL: "/rate",
    GET_BY_ID: (id) => `/rate/${id}`,
    UPDATE: (id) => `/rate/${id}`,
    DELETE: (id) => `/rate/${id}`,
  },

  // User endpoints
  USER: {
    UPDATE: "/user",
    UPDATE_ROLE: "/user/role",
    DELETE: "/user",
    RESET_PASSWORD: "/user/reset_password",
    FORGOT_PASSWORD: "/user/forgot-password",
    RESET_PASSWORD_TOKEN: (token) => `/user/reset-password/${token}`,
    GET_ME: "/user/me",
  },

  // Chatbot endpoints
  CHATBOT: {
    SEND_MESSAGE: "/chatbot",
  },

  // Gold Price endpoints
  PRICE: {
    GRAM_18: "/price/price-gram/18",
    GRAM_21: "/price/price-gram/21",
    GRAM_24: "/price/price-gram/24",
    CALCULATE_PRODUCT: "/price/calculate-product-price",
  },
};

// User Types (matching backend user model)
export const USER_TYPES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  CHAINS: "chains",
  RINGS: "rings",
  BRACELETS: "bracelets",
  EARRINGS: "earrings",
  NECKLACES: "necklaces",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "dibla_token",
  USER: "dibla_user",
  REFRESH_TOKEN: "dibla_refresh_token",
};

// Routes
export const ROUTES = {
  HOME: "/",
  LANDING: "/landing",

  // Auth routes
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  USER_TYPE_SELECTION: "/auth/user-type",
  FORGOT_PASSWORD: "/auth/forgot-password",

  // Shop routes
  SHOPS: "/shops",
  SHOP_DETAILS: (id) => `/shops/${id}`,
  CREATE_SHOP: "/shop/create",
  EDIT_SHOP: "/shop/edit",
  EDIT_SHOP_ID: (id) => `/shop/edit/${id}`,
  MANAGE_SHOP: "/shop/manage",
  SHOP_QR_CODE: "/shop/qr-code",


  // Product routes
  PRODUCTS: "/products",
  PRODUCT_DETAILS: (id) => `/products/${id}`,
  CREATE_PRODUCT: "/products/create",
  EDIT_PRODUCT: (id) => `/products/edit/${id}`,
  FAVORITES: "/favorites",

  // Booking routes
  BOOK_APPOINTMENT: (shopId) => `/book-appointment/${shopId}`,
  MY_BOOKINGS: "/my-bookings",
  MANAGE_BOOKINGS: "/bookings/manage",
  MANAGE_TIMES: "/manage-times",
  BOOKINGS_ONLY: "/bookings-only",
  TIME_MANAGEMENT: "/time-management",

  // Rating routes
  MANAGE_RATINGS: "/manage-ratings",

  // User routes
  PROFILE: "/profile",
  SETTINGS: "/settings",
  DASHBOARD: "/dashboard",

  // Additional routes
  PRODUCTS_CREATE: "/products/create",

  // Admin routes
  ADMIN_DASHBOARD: "/admin",
  ADMIN_SHOPS: "/admin/shops",
  ADMIN_USERS: "/admin/users",

  // Other
  NOT_FOUND: "/404",
};

// Colors (New Design System)
export const COLORS = {
  // Primary Colors
  PRIMARY_1: "#FAF7EA", // Primary 1
  PRIMARY_2: "#F6EED5", // Primary 2
  PRIMARY: "#D4AF37", // Button Primary 500 (main brand color)
  PRIMARY_HOVER: "#A88924", // Button Primary Hover

  // Secondary Colors
  SECONDARY_1: "#F2F2F2", // Secondary 1
  SECONDARY_2: "#E6E6E6", // Secondary 2

  // Button Colors
  BUTTON_PRIMARY: "#D4AF37", // Button Primary 500
  BUTTON_PRIMARY_HOVER: "#A88924", // Button Primary Hover
  BUTTON_SUCCESS: "#21CF61", // Success 500
  BUTTON_SUCCESS_HOVER: "#1CA651", // Success Hover 600
  BUTTON_ERROR: "#FD0D0D", // Error 500
  BUTTON_ERROR_HOVER: "#D80604", // Error Hover 600

  // Background Colors
  BACKGROUND: "#FFFFFF", // Background
  BACKGROUND_SECONDARY: "#FAF7EA", // Primary 1
  BACKGROUND_TERTIARY: "#F6EED5", // Primary 2
  BACKGROUND_NEUTRAL: "#F2F2F2", // Secondary 1

  // Text Colors
  TEXT_PRIMARY: "#2A2209", // Text Primary 900
  TEXT_SECONDARY: "#4D4D4D", // Secondary text
  TEXT_MUTED: "#737373", // Muted text
  TEXT_INVERSE: "#FFFFFF", // White text for dark backgrounds

  // Status Colors
  SUCCESS: "#21CF61", // Success 500
  SUCCESS_HOVER: "#1CA651", // Success Hover 600
  ERROR: "#FD0D0D", // Error 500
  ERROR_HOVER: "#D80604", // Error Hover 600
  WARNING: "#F59E0B", // Warning (maintained for compatibility)
  INFO: "#3B82F6", // Info (maintained for compatibility)

  // Border Colors
  BORDER_LIGHT: "#E6E6E6", // Secondary 2
  BORDER_MEDIUM: "#D9D9D9",
  BORDER_DARK: "#CCCCCC",

  // Basic Colors
  WHITE: "#FFFFFF",
  BLACK: "#000000",

  // Dark Mode Colors
  DARK: {
    BACKGROUND: "#0D0D0D",
    SURFACE: "#262626",
    TEXT: "#FFFFFF",
    TEXT_MUTED: "#BFBFBF",
    BORDER: "#4D4D4D",
  },
};

// Breakpoints
export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
};

// Animation Durations
export const ANIMATION = {
  FAST: "150ms",
  NORMAL: "300ms",
  SLOW: "500ms",
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: "تم تسجيل الدخول بنجاح",
    REGISTER: "تم إنشاء الحساب بنجاح",
    LOGOUT: "تم تسجيل الخروج بنجاح",
    UPDATE: "تم التحديث بنجاح",
    DELETE: "تم الحذف بنجاح",
    CREATE: "تم الإنشاء بنجاح",
  },
  ERROR: {
    GENERAL: "حدث خطأ ما، يرجى المحاولة مرة أخرى",
    NETWORK: "خطأ في الاتصال بالشبكة",
    UNAUTHORIZED: "غير مصرح لك بالوصول",
    NOT_FOUND: "الصفحة غير موجودة",
    VALIDATION: "يرجى التحقق من البيانات المدخلة",
  },
};

// Validation Rules
export const VALIDATION = {
  EMAIL: {
    REQUIRED: "البريد الإلكتروني مطلوب",
    INVALID: "البريد الإلكتروني غير صحيح",
  },
  PASSWORD: {
    REQUIRED: "كلمة المرور مطلوبة",
    MIN_LENGTH: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    MISMATCH: "كلمة المرور غير متطابقة",
  },
  NAME: {
    REQUIRED: "الاسم مطلوب",
    MIN_LENGTH: "الاسم يجب أن يكون حرفين على الأقل",
  },
  PHONE: {
    REQUIRED: "رقم الهاتف مطلوب",
    INVALID: "رقم الهاتف غير صحيح",
  },
};

// API Base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5011";

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

// Colors (Golden Brown & Beige Theme)
export const COLORS = {
  // Primary Colors (Golden Brown)
  PRIMARY: "#A37F41", // Main brand color
  PRIMARY_LIGHT: "#C5A56D",
  PRIMARY_DARK: "#8A6C37",
  PRIMARY_DARKER: "#6D552C",
  PRIMARY_DARKEST: "#49391D",

  // Secondary Colors (Beige & Earthy)
  SECONDARY: "#E2D2B6", // Secondary color
  SECONDARY_LIGHT: "#F0E8DB",
  SECONDARY_LIGHTER: "#F8F4ED",
  SECONDARY_DARK: "#D3BB92",
  SECONDARY_DARKER: "#92723A",

  // Background Colors
  BACKGROUND: "#F8F4ED", // Light beige background
  SURFACE: "#FFFFFF", // White surface
  SURFACE_ALT: "#F0E8DB", // Alternative surface

  // Text Colors
  TEXT: "#241C0F", // Primary text
  TEXT_SECONDARY: "#49391D", // Secondary text
  TEXT_TERTIARY: "#6D552C", // Less important text

  // Status Colors
  SUCCESS: "#5C8A3C", // Green
  WARNING: "#D4A546", // Amber
  ERROR: "#B54A35", // Reddish-brown
  INFO: "#4A7997", // Blue-gray

  // Basic Colors
  WHITE: "#FFFFFF",
  BLACK: "#000000",

  // Dark Mode Colors
  DARK: {
    BACKGROUND: "#120E07",
    SURFACE: "#241C0F",
    TEXT: "#F0E8DB",
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

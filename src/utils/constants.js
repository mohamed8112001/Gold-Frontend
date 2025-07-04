// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    GOOGLE_FAILURE: '/auth/google/failure',
  },
  
  // Shop endpoints
  SHOP: {
    CREATE: '/shop/create',
    GET_ALL: '/shop',
    GET_BY_ID: (id) => `/shop/${id}`,
    UPDATE: (id) => `/shop/${id}`,
    DELETE: (id) => `/shop/${id}`,
  },
  
  // Product endpoints
  PRODUCT: {
    CREATE: '/product/create',
    GET_ALL: '/product',
    GET_BY_ID: (id) => `/product/${id}`,
    UPDATE: (id) => `/product/${id}`,
    DELETE: (id) => `/product/${id}`,
    ADD_FAVORITE: '/product/favorite',
    GET_FAVORITES: (id) => `/product/favorite/${id}`,
    REMOVE_FAVORITE: (id) => `/product/favorite/${id}`,
  },
  
  // Booking endpoints
  BOOKING: {
    ADD_TIME: '/booking',
    GET_TIMES: (shopId) => `/booking/${shopId}`,
    BOOK: '/booking/book',
  },
  
  // Rate endpoints
  RATE: {
    CREATE: (shopId) => `/rate/${shopId}`,
    GET_ALL: '/rate',
    GET_BY_ID: (id) => `/rate/${id}`,
    UPDATE: (id) => `/rate/${id}`,
    DELETE: (id) => `/rate/${id}`,
  },
  
  // User endpoints
  USER: {
    UPDATE: '/user',
    UPDATE_ROLE: '/user/role',
    DELETE: '/user',
    RESET_PASSWORD: '/user/reset_password',
    FORGOT_PASSWORD: '/user/forgot-password',
    RESET_PASSWORD_TOKEN: (token) => `/user/reset-password/${token}`,
    GET_ME: '/user/me',
  },
};

// User Types (matching backend user model)
export const USER_TYPES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  CHAINS: 'chains',
  RINGS: 'rings',
  BRACELETS: 'bracelets',
  EARRINGS: 'earrings',
  NECKLACES: 'necklaces',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'dibla_token',
  USER: 'dibla_user',
  REFRESH_TOKEN: 'dibla_refresh_token',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LANDING: '/landing',
  
  // Auth routes
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  USER_TYPE_SELECTION: '/auth/user-type',
  FORGOT_PASSWORD: '/auth/forgot-password',
  
  // Shop routes
  SHOPS: '/shops',
  SHOP_DETAILS: (id) => `/shops/${id}`,
  CREATE_SHOP: '/shop/create',
  MANAGE_SHOP: '/shop/manage',
  
  // Product routes
  PRODUCTS: '/products',
  PRODUCT_DETAILS: (id) => `/products/${id}`,
  CREATE_PRODUCT: '/products/create',
  FAVORITES: '/favorites',
  
  // Booking routes
  BOOK_APPOINTMENT: (shopId) => `/booking/${shopId}`,
  MY_BOOKINGS: '/my-bookings',
  
  // User routes
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',
  
  // Other
  NOT_FOUND: '/404',
};

// Colors (matching the design)
export const COLORS = {
  PRIMARY: '#D4A574', // Gold color from design
  SECONDARY: '#8B7355',
  BACKGROUND: '#F5F5F5',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GRAY: {
    100: '#F7F7F7',
    200: '#E5E5E5',
    300: '#D1D1D1',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

// Breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
};

// Animation Durations
export const ANIMATION = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms',
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'تم تسجيل الدخول بنجاح',
    REGISTER: 'تم إنشاء الحساب بنجاح',
    LOGOUT: 'تم تسجيل الخروج بنجاح',
    UPDATE: 'تم التحديث بنجاح',
    DELETE: 'تم الحذف بنجاح',
    CREATE: 'تم الإنشاء بنجاح',
  },
  ERROR: {
    GENERAL: 'حدث خطأ ما، يرجى المحاولة مرة أخرى',
    NETWORK: 'خطأ في الاتصال بالشبكة',
    UNAUTHORIZED: 'غير مصرح لك بالوصول',
    NOT_FOUND: 'الصفحة غير موجودة',
    VALIDATION: 'يرجى التحقق من البيانات المدخلة',
  },
};

// Validation Rules
export const VALIDATION = {
  EMAIL: {
    REQUIRED: 'البريد الإلكتروني مطلوب',
    INVALID: 'البريد الإلكتروني غير صحيح',
  },
  PASSWORD: {
    REQUIRED: 'كلمة المرور مطلوبة',
    MIN_LENGTH: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    MISMATCH: 'كلمة المرور غير متطابقة',
  },
  NAME: {
    REQUIRED: 'الاسم مطلوب',
    MIN_LENGTH: 'الاسم يجب أن يكون حرفين على الأقل',
  },
  PHONE: {
    REQUIRED: 'رقم الهاتف مطلوب',
    INVALID: 'رقم الهاتف غير صحيح',
  },
};


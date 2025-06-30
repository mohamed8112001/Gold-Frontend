// بيانات وهمية للمنتجات
export const mockProducts = [
  // منتجات Royal Gold Cairo (Store ID: 1)
  {
    id: 1,
    name: "خاتم ذهبي ملكي",
    description: "خاتم ذهب عيار 21 بتصميم ملكي فاخر مرصع بالأحجار الكريمة",
    price: 2500,
    originalPrice: 3000,
    discount: 17,
    category: "خواتم",
    storeId: 1,
    images: [
      "https://cdn.salla.sa/wvABj/b9aa8dcf-0ca1-41fc-973d-f4235bf14c6f-1000x1000-nFOY7vpQaLGoMXAZnYqO3J7sCwtDo0RIqFu2iANR.jpg",
      "/api/placeholder/400/400",
      "/api/placeholder/400/400"
    ],
    rating: 4.8,
    reviewsCount: 24,
    inStock: true,
    weight: "15 جرام",
    material: "ذهب عيار 21",
    size: "قابل للتعديل",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "قلادة اللؤلؤ الملكية",
    description: "قلادة ذهبية فاخرة مرصعة باللؤلؤ الطبيعي والألماس",
    price: 4200,
    originalPrice: 5000,
    discount: 16,
    category: "قلائد",
    storeId: 1,
    images: [
      "https://media.zid.store/d67f97e9-8fa0-4e94-9015-20b546ecf738/0cb8ee02-9e32-450b-b648-2d4042b81b0f.jpeg",
      "/api/placeholder/400/400"
    ],
    rating: 4.9,
    reviewsCount: 18,
    inStock: true,
    weight: "25 جرام",
    material: "ذهب عيار 18 + لؤلؤ طبيعي",
    size: "45 سم",
    createdAt: "2024-01-20"
  },
  {
    id: 3,
    name: "سوار التاج الذهبي",
    description: "سوار ذهبي بتصميم التاج الملكي مع نقوش يدوية دقيقة",
    price: 1800,
    originalPrice: 1800,
    discount: 0,
    category: "أساور",
    storeId: 1,
    images: [
      "https://www.faberge.com/cdn/shop/files/heritage-yellow-gold-diamond-turquoise-guilloche-enamel-open-bracelet-135723-0.webp?v=1723473767&width=1946"
    ],
    rating: 4.7,
    reviewsCount: 12,
    inStock: true,
    weight: "12 جرام",
    material: "ذهب عيار 21",
    size: "قابل للتعديل",
    createdAt: "2024-01-25"
  },

  // منتجات Alexandria Jewels (Store ID: 2)
  {
    id: 4,
    name: "خاتم الخطوبة الكلاسيكي",
    description: "خاتم خطوبة أنيق بتصميم كلاسيكي مرصع بحجر الألماس",
    price: 3500,
    originalPrice: 4000,
    discount: 13,
    category: "خواتم",
    storeId: 2,
    images: [
      "https://img.joomcdn.net/2977eea3f820d4b48511f04891ca9cfadd324f98_original.jpeg",
      "/api/placeholder/400/400"
    ],
    rating: 4.6,
    reviewsCount: 31,
    inStock: true,
    weight: "8 جرام",
    material: "ذهب أبيض عيار 18 + ألماس",
    size: "مقاسات متعددة",
    createdAt: "2024-01-18"
  },
  {
    id: 5,
    name: "ساعة ذهبية عصرية",
    description: "ساعة يد ذهبية بتصميم عصري وحركة سويسرية دقيقة",
    price: 5200,
    originalPrice: 6000,
    discount: 13,
    category: "ساعات",
    storeId: 2,
    images: [
      "https://ae01.alicdn.com/kf/S9c250b4c8f544587b1d7266365ba95b4i.jpg",
      "/api/placeholder/400/400",
      "/api/placeholder/400/400"
    ],
    rating: 4.8,
    reviewsCount: 15,
    inStock: true,
    weight: "45 جرام",
    material: "ذهب عيار 18 + حركة سويسرية",
    size: "قابل للتعديل",
    createdAt: "2024-01-22"
  },

  // منتجات Pharaoh's Treasures (Store ID: 3)
  {
    id: 6,
    name: "قلادة عين حورس الذهبية",
    description: "قلادة فرعونية أصيلة بتصميم عين حورس مصنوعة من الذهب الخالص",
    price: 2800,
    originalPrice: 2800,
    discount: 0,
    category: "قلائد",
    storeId: 3,
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9DLjsgJWIf1bUtMxOMfKD9A35hwyhEO0DBw&s",
      "/api/placeholder/400/400"
    ],
    rating: 4.9,
    reviewsCount: 42,
    inStock: true,
    weight: "20 جرام",
    material: "ذهب عيار 21",
    size: "50 سم",
    createdAt: "2024-01-10"
  },
  {
    id: 7,
    name: "تمثال أنوبيس الذهبي",
    description: "تمثال ذهبي صغير للإله أنوبيس بتفاصيل دقيقة ونقوش هيروغليفية",
    price: 6500,
    originalPrice: 7500,
    discount: 13,
    category: "تماثيل",
    storeId: 3,
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKWZ2LnDMdX3zgSI2S8q9l4m3AvU9Ki-WZWQ&s"
    ],
    rating: 5.0,
    reviewsCount: 8,
    inStock: true,
    weight: "85 جرام",
    material: "ذهب عيار 22",
    size: "12 سم ارتفاع",
    createdAt: "2024-01-12"
  },

  // منتجات Golden Nile (Store ID: 4)
  {
    id: 8,
    name: "سوار النيل التقليدي",
    description: "سوار تقليدي بتصميم نوبي أصيل مستوحى من ضفاف النيل",
    price: 1200,
    originalPrice: 1400,
    discount: 14,
    category: "أساور",
    storeId: 4,
    images: [
      "/api/placeholder/400/400",
      "/api/placeholder/400/400"
    ],
    rating: 4.5,
    reviewsCount: 19,
    inStock: true,
    weight: "18 جرام",
    material: "ذهب عيار 21",
    size: "قابل للتعديل",
    createdAt: "2024-01-28"
  },

  // منتجات Cleopatra Designs (Store ID: 5)
  {
    id: 9,
    name: "تاج كليوباترا المصغر",
    description: "تصميم حصري لتاج كليوباترا مصغر كقلادة فاخرة مرصعة بالأحجار",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    category: "قلائد",
    storeId: 5,
    images: [
      "/api/placeholder/400/400",
      "/api/placeholder/400/400",
      "/api/placeholder/400/400"
    ],
    rating: 4.9,
    reviewsCount: 6,
    inStock: true,
    weight: "35 جرام",
    material: "ذهب عيار 18 + أحجار كريمة",
    size: "تصميم حصري",
    createdAt: "2024-01-30"
  },

  // منتجات إضافية لمحلات أخرى
  {
    id: 10,
    name: "خاتم الفيروز النوبي",
    description: "خاتم نوبي تقليدي مرصع بحجر الفيروز الطبيعي",
    price: 950,
    originalPrice: 950,
    discount: 0,
    category: "خواتم",
    storeId: 7,
    images: [
      "/api/placeholder/400/400"
    ],
    rating: 4.4,
    reviewsCount: 13,
    inStock: true,
    weight: "10 جرام",
    material: "فضة + فيروز طبيعي",
    size: "مقاسات متعددة",
    createdAt: "2024-02-01"
  },
  {
    id: 11,
    name: "قلادة الخط العربي",
    description: "قلادة ذهبية بخط عربي جميل لآية قرآنية أو اسم",
    price: 1800,
    originalPrice: 2000,
    discount: 10,
    category: "قلائد",
    storeId: 8,
    images: [
      "/api/placeholder/400/400",
      "/api/placeholder/400/400"
    ],
    rating: 4.7,
    reviewsCount: 25,
    inStock: true,
    weight: "15 جرام",
    material: "ذهب عيار 21",
    size: "40 سم",
    createdAt: "2024-02-03"
  },
  {
    id: 12,
    name: "سوار اللؤلؤ البحري",
    description: "سوار مرصع باللؤلؤ الطبيعي من البحر الأحمر",
    price: 2200,
    originalPrice: 2500,
    discount: 12,
    category: "أساور",
    storeId: 9,
    images: [
      "/api/placeholder/400/400"
    ],
    rating: 4.6,
    reviewsCount: 11,
    inStock: true,
    weight: "22 جرام",
    material: "ذهب عيار 18 + لؤلؤ طبيعي",
    size: "قابل للتعديل",
    createdAt: "2024-02-05"
  }
];

// دالة للحصول على منتج بالمعرف
export const getProductById = (id) => {
  return mockProducts.find(product => product.id === id);
};

// دالة للحصول على منتجات محل معين
export const getProductsByStoreId = (storeId) => {
  return mockProducts.filter(product => product.storeId === storeId);
};

// دالة للبحث في المنتجات
export const searchProducts = (query) => {
  if (!query) return mockProducts;
  
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  );
};

// دالة للحصول على منتجات بفئة معينة
export const getProductsByCategory = (category) => {
  return mockProducts.filter(product => product.category === category);
};

// دالة للحصول على المنتجات المخفضة
export const getDiscountedProducts = () => {
  return mockProducts.filter(product => product.discount > 0);
};

// فئات المنتجات
export const productCategories = [
  "خواتم",
  "قلائد", 
  "أساور",
  "ساعات",
  "تماثيل",
  "إكسسوارات"
];


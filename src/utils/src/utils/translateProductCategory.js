// src/utils/translateProductCategory.js

export function translateProductCategory(key) {
  const categories = {
    rings: 'خواتم',
    necklaces: 'عقود',
    bracelets: 'أساور',
    earrings: 'أقراط',
    chains: 'سلاسل',
    pendants: 'معلقات',
    sets: 'أطقم',
    watches: 'ساعات',
    other: 'أخرى',
  };

  if (!key) return 'غير معروف';
  return categories[key.toLowerCase()] || 'غير معروف';
}

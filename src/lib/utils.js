import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatCurrency(amount, currency = 'EGP') {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatTime(time) {
  return new Intl.DateTimeFormat('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(time))
}

/**
 * ترجمة فئة المنتج باستخدام نظام الترجمة
 * @param {string} category - فئة المنتج بالإنجليزية
 * @param {Function} t - دالة الترجمة من react-i18next
 * @returns {string} - فئة المنتج المترجمة
 */
export function translateProductCategory(category, t) {
  if (!category || !t) return category;
  
  // تحويل الفئة إلى lowercase للتطابق مع مفاتيح الترجمة
  const categoryKey = category.toLowerCase();
  
  // محاولة الترجمة من ملف الترجمة
  const translation = t(`product_categories.${categoryKey}`);
  
  // إذا لم توجد ترجمة، إرجاع الفئة الأصلية
  return translation !== `product_categories.${categoryKey}` ? translation : category;
}


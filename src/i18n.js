import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// لا داعي لاستيراد ملف en.json بعد الآن
import ar from "./locales/ar.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
    },
    lng: "ar", // إجبار اللغة العربية
    fallbackLng: "ar", // fallback أيضًا للعربية
    interpolation: {
      escapeValue: false,
    },
    detection: { // تعطيل الكشف التلقائي عن اللغة
      order: [],
      caches: [],
    },
  });

export default i18n;

# Dibla Frontend - Gold Market Application

## نظرة عامة
تطبيق Dibla هو منصة لعرض وتصفح متاجر الذهب والمجوهرات في مصر، مع إمكانية حجز المواعيد وتقييم المتاجر.

## المميزات
- 🔐 نظام تسجيل الدخول والتسجيل (عادي + Google OAuth)
- 👤 نوعان من المستخدمين: العملاء وأصحاب المتاجر
- 🏪 عرض وإدارة المتاجر
- 💍 عرض وإدارة المنتجات (سلاسل، خواتم، أساور)
- 📅 نظام حجز المواعيد
- ⭐ نظام تقييم المتاجر
- ❤️ قائمة المفضلة
- 📱 تصميم متجاوب مع الأجهزة المحمولة

## التقنيات المستخدمة
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Animations**: Framer Motion

## هيكل المشروع

```
src/
├── assets/          # الصور والأيقونات
├── components/      # المكونات القابلة لإعادة الاستخدام
│   ├── ui/         # مكونات واجهة المستخدم الأساسية
│   ├── layout/     # مكونات التخطيط
│   ├── auth/       # مكونات التسجيل
│   ├── shop/       # مكونات المتاجر
│   ├── product/    # مكونات المنتجات
│   ├── booking/    # مكونات الحجز
│   └── common/     # المكونات المشتركة
├── pages/          # صفحات التطبيق
├── services/       # خدمات API
├── context/        # React Context
├── hooks/          # Custom Hooks
├── utils/          # المساعدات والثوابت
└── styles/         # ملفات الأنماط
```

## الأوامر المطلوبة

### إنشاء المشروع من البداية
```bash
# إنشاء مشروع React جديد
npx create-react-app dibla-frontend
cd dibla-frontend

# أو باستخدام Vite (الأسرع)
npm create vite@latest dibla-frontend -- --template react
cd dibla-frontend
npm install

# تثبيت المكتبات المطلوبة
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install lucide-react framer-motion
npm install react-hook-form @hookform/resolvers zod
```

### تشغيل المشروع
```bash
# تشغيل خادم التطوير
npm run dev

# أو
pnpm run dev

# الوصول للتطبيق على
http://localhost:5173
```

### بناء المشروع للإنتاج
```bash
npm run build
```

## متغيرات البيئة
قم بإنشاء ملف `.env` في جذر المشروع:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## الصفحات الرئيسية

### للمستخدمين العاديين:
- `/` - الصفحة الرئيسية
- `/auth/login` - تسجيل الدخول
- `/auth/register` - التسجيل
- `/auth/user-type` - اختيار نوع الحساب
- `/shops` - قائمة المتاجر
- `/shops/:id` - تفاصيل المتجر
- `/products` - قائمة المنتجات
- `/products/:id` - تفاصيل المنتج
- `/favorites` - المفضلة
- `/booking/:shopId` - حجز موعد
- `/my-bookings` - مواعيدي
- `/profile` - الملف الشخصي

### لأصحاب المتاجر:
- `/dashboard` - لوحة التحكم
- `/shop/create` - إنشاء متجر
- `/shop/manage` - إدارة المتجر
- `/products/create` - إضافة منتج
- `/bookings/manage` - إدارة المواعيد

## API Endpoints

### Authentication
- `POST /auth/register` - تسجيل حساب جديد
- `POST /auth/login` - تسجيل الدخول
- `GET /auth/logout` - تسجيل الخروج
- `GET /auth/refresh` - تحديث التوكن

### Shops
- `GET /shop` - الحصول على جميع المتاجر
- `GET /shop/:id` - الحصول على متجر محدد
- `POST /shop/create` - إنشاء متجر جديد
- `PUT /shop/:id` - تحديث متجر
- `DELETE /shop/:id` - حذف متجر

### Products
- `GET /product` - الحصول على جميع المنتجات
- `GET /product/:id` - الحصول على منتج محدد
- `POST /product/create` - إنشاء منتج جديد
- `PUT /product/:id` - تحديث منتج
- `DELETE /product/:id` - حذف منتج
- `POST /product/favorite` - إضافة إلى المفضلة
- `GET /product/favorite/:id` - الحصول على المفضلة

### Booking
- `GET /booking/:shopId` - الحصول على الأوقات المتاحة
- `POST /booking/book` - حجز موعد
- `POST /booking` - إضافة وقت متاح

### Rating
- `POST /rate/:shopId` - تقييم متجر
- `GET /rate` - الحصول على التقييمات
- `PUT /rate/:id` - تحديث تقييم
- `DELETE /rate/:id` - حذف تقييم

### User
- `GET /user/me` - الحصول على بيانات المستخدم
- `PUT /user` - تحديث المستخدم
- `DELETE /user` - حذف المستخدم
- `POST /user/forgot-password` - نسيان كلمة المرور
- `POST /user/reset-password/:token` - إعادة تعيين كلمة المرور

## المساهمة
1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص
هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم
للحصول على الدعم، يرجى التواصل عبر البريد الإلكتروني أو فتح issue في GitHub.


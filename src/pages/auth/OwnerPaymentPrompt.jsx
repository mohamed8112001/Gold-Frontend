import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react';

const GoldIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto mb-4"
  >
    <circle cx="24" cy="24" r="20" fill="url(#goldGradient)" />
    <path
      d="M24 8L28 16H32L26 20L28 28L24 24L20 28L22 20L16 16H20L24 8Z"
      fill="#fff"
      opacity="0.9"
    />
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
    </defs>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      fill="currentColor"
    />
  </svg>
);

export default function GoldStorePaymentPrompt() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {user, updateUser} = useAuth()

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    if (!user) {
      setLoading(false);
      setError('مطلوب تسجيل الدخول أولاً');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          productId: 'price_1Rnf4y2XYUV5klvc9QfaTrIr',
          email: user?.email
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Payment response:', data);
      
      if (data && typeof data === 'string' && data.startsWith('https://checkout.stripe.com')) {
        // Show loading state briefly before redirect
        setTimeout(() => {
          window.location.href = data;
        }, 500);
      } else {
        setError('رابط جلسة الدفع غير صحيح.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('خطأ في بدء جلسة الدفع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateHome = () => {
    console.log('Navigating to dashboard...');
  };

  const features = [
    "إدارة متقدمة للمخزون والمعروضات",
    "تتبع أسعار الذهب في الوقت الفعلي",
    "أدوات إدارة علاقات العملاء",
    "تقارير وتحليلات المبيعات التفصيلية",
    "معالجة آمنة للمدفوعات",
    "دعم فني على مدار الساعة"
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4"
      style={{ fontFamily: "'Noto Sans Arabic', 'Cairo', 'Amiri', 'Tajawal', sans-serif" }}
      dir="rtl"
    >
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            
            {/* Right Side - Hero Section (RTL) */}
            <div className="bg-gradient-to-br from-amber-600 via-yellow-500 to-orange-600 p-8 lg:p-12 text-white relative overflow-hidden order-2 lg:order-1">
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="relative z-10">
                <GoldIcon />
                <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                  حوّل متجر الذهب الخاص بك
                </h1>
                <p className="text-xl mb-8 text-amber-100 leading-relaxed">
                  انضم إلى آلاف أصحاب متاجر الذهب الناجحين الذين طوروا أعمالهم مع منصتنا الشاملة والمتطورة.
                </p>
                
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 space-x-reverse">
                      <div className="bg-white bg-opacity-20 rounded-full p-1">
                        <CheckIcon />
                      </div>
                      <span className="text-amber-100 text-right">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 -translate-x-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 translate-x-12"></div>
            </div>

            {/* Left Side - Payment Form (RTL) */}
            <div className="p-8 lg:p-12 order-1 lg:order-2">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  فعّل متجرك الآن
                </h2>
                <p className="text-gray-600 text-lg">
                  ابدأ رحلتك نحو زيادة الأرباح وتبسيط العمليات التجارية
                </p>
              </div>

              {/* Pricing Card */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 mb-8 border border-amber-200">
                <div className="text-center">
                  <div className="text-amber-600 font-semibold text-sm uppercase tracking-wide mb-2">
                    الباقة الاحترافية
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">30$</span>
                    <span className="text-gray-600 mr-2">/شهرياً</span>
                  </div>
                  <div className="bg-amber-100 text-amber-800 text-sm font-medium px-4 py-2 rounded-full inline-block">
                    الأكثر شعبية
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>جارٍ المعالجة...</span>
                  </div>
                ) : (
                  'فعّل متجري الآن'
                )}
              </button>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-5 h-5 text-red-500">⚠️</div>
                    <p className="text-red-700 font-medium text-right">{error}</p>
                  </div>
                </div>
              )}

              {/* Security & Trust */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-500 space-y-2">
                  <p>🔒 دفع آمن مدعوم بواسطة Stripe</p>
                  <p>💳 جميع طرق الدفع الرئيسية مقبولة</p>
                  <p>📞 إلغاء في أي وقت مع دعم على مدار الساعة</p>
                </div>
              </div>

              {/* Back to Home */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleNavigateHome}
                  className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
                >
                  العودة إلى لوحة التحكم
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 sm:space-x-reverse text-gray-600 text-sm">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span>⭐⭐⭐⭐⭐</span>
              <span>4.9/5 من أكثر من 1,200 متجر</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            <div>ضمان استرداد الأموال لمدة 30 يوماً</div>
          </div>
        </div>

        {/* Load Arabic fonts */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&family=Tajawal:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </div>
    </div>
  );
}
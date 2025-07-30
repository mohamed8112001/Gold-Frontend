import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Package,
  Store,
  Calculator
} from 'lucide-react';
import { reservationService } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const ReservationPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // البيانات المرسلة من صفحة المنتج
  const { product, reservationData } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [paymentStep, setPaymentStep] = useState('payment'); // 'payment' -> 'processing' -> 'success'
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // التحقق من وجود البيانات المطلوبة
  useEffect(() => {
    console.log('🔍 Checking reservation payment data:', { product, reservationData, user });

    if (!product || !reservationData) {
      console.log('❌ Missing product or reservation data, redirecting to home');
      navigate(ROUTES.HOME);
      return;
    }

    if (!user) {
      console.log('❌ User not logged in, redirecting to login');
      navigate(ROUTES.LOGIN);
      return;
    }

    console.log('✅ All data available, ready for reservation');
  }, [product, reservationData, user, navigate]);

  // حساب مبالغ الحجز
  const amounts = reservationData ? reservationService.calculateReservationAmount(product?.price || 0) : null;

  const handlePayment = async () => {
    if (!amounts || !product) {
      console.log('❌ Missing amounts or product data');
      return;
    }

    console.log('💳 Starting Stripe payment process:', {
      productId: product._id || product.id,
      amounts,
      user: user?.name
    });

    setLoading(true);
    setError('');

    try {
      // إنشاء جلسة دفع Stripe للحجز
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/create-reservation-payment-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id || product.id,
          reservationAmount: parseFloat(amounts.reservationAmount),
          email: user?.email,
          productName: product.name || product.title
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const checkoutUrl = await response.json();
      console.log('✅ Stripe checkout URL received:', checkoutUrl);

      if (checkoutUrl && typeof checkoutUrl === 'string' && checkoutUrl.startsWith('https://checkout.stripe.com')) {
        // إعادة توجيه إلى صفحة دفع Stripe
        window.location.href = checkoutUrl;
      } else {
        throw new Error('رابط جلسة الدفع غير صحيح');
      }

    } catch (err) {
      console.error('Payment error:', err);
      console.error('Error response:', err.response?.data);

      let errorMessage = 'حدث خطأ في عملية الدفع';

      if (err.response?.status === 401) {
        errorMessage = 'يجب تسجيل الدخول أولاً';
      } else if (err.response?.status === 404) {
        errorMessage = 'المنتج غير موجود';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate(ROUTES.HOME);
  };

  const handleViewReservations = () => {
    navigate('/my-reservations');
  };

  if (!product || !amounts) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">خطأ في البيانات</h2>
          <Button onClick={() => navigate(ROUTES.HOME)}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">تم الحجز بنجاح! 🎉</h1>
            
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">تفاصيل الحجز</h3>
              <div className="space-y-2 text-right">
                <p><strong>المنتج:</strong> {product.name}</p>
                <p><strong>المبلغ المدفوع:</strong> {amounts.reservationAmount} جنيه (10%)</p>
                <p><strong>المبلغ المتبقي:</strong> {amounts.remainingAmount} جنيه</p>
                <p><strong>إجمالي السعر:</strong> {amounts.totalAmount} جنيه</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">ملاحظات مهمة</h3>
              <ul className="text-blue-700 text-sm space-y-1 text-right">
                <li>• تم حجز المنتج لمدة 7 أيام</li>
                <li>• يمكنك دفع المبلغ المتبقي عند الاستلام</li>
                <li>• ستتلقى إشعاراً قبل انتهاء فترة الحجز</li>
                <li>• يمكنك إلغاء الحجز في أي وقت</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleViewReservations} className="bg-blue-500 hover:bg-blue-600">
                عرض حجوزاتي
              </Button>
              <Button onClick={handleContinueShopping} variant="outline">
                متابعة التسوق
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 font-cairo">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">احجز المنتج الآن</h1>
          <p className="text-gray-600">ادفع 10% فقط واحتفظ بالمنتج لمدة 7 أيام</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 rtl">
          {/* تفاصيل المنتج */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Package className="w-6 h-6" />
              تفاصيل المنتج
            </h2>
            
            <div className="flex items-start gap-6 mb-6">
              {product.logoUrl && (
                <img 
                  src={product.logoUrl} 
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900">{product.name}</h3>
                <p className="text-gray-600 mt-2 text-lg">{product.description}</p>
                <Badge className="mt-3 bg-green-100 text-green-800 text-base px-4 py-1">متوفر</Badge>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4 text-lg">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-600">العيار</span>
                <span className="font-semibold">{product.karat || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-600">الوزن</span>
                <span className="font-semibold">{product.weight || 'غير محدد'} جرام</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <span className="text-gray-600">المتجر</span>
                <span className="font-semibold">{product.shopName || 'غير محدد'}</span>
              </div>
            </div>
          </div>

          {/* تفاصيل الدفع */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Calculator className="w-6 h-6" />
              تفاصيل الدفع
            </h2>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between text-xl">
                  <span>إجمالي سعر المنتج</span>
                  <span className="font-bold text-gray-900">{amounts.totalAmount} جنيه</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl text-blue-700">
                  <span>المبلغ المطلوب الآن (10%)</span>
                  <span className="font-bold">{amounts.reservationAmount} جنيه</span>
                </div>
                <div className="flex justify-between text-xl text-gray-600">
                  <span>المبلغ المتبقي</span>
                  <span className="font-bold">{amounts.remainingAmount} جنيه</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-xl mb-4">شروط الحجز</h4>
                  <ul className="text-blue-800 text-lg space-y-3">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      فترة الحجز: 7 أيام من تاريخ الدفع
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      دفع المبلغ المتبقي عند الاستلام
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      إمكانية الإلغاء في أي وقت
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
                <p className="text-red-700 text-center text-lg">{error}</p>
              </div>
            )}

            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-l from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-6 rounded-2xl font-bold text-xl"
            >
              {loading ? (
                'جاري المعالجة...'
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <CreditCard className="w-6 h-6" />
                  <span>ادفع {amounts.reservationAmount} جنيه واحجز المنتج</span>
                </div>
              )}
            </Button>

            <div className="flex items-center justify-center gap-3 mt-6 text-base text-gray-500">
              <Shield className="w-5 h-5" />
              <span>دفع آمن ومشفر بالكامل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPayment;

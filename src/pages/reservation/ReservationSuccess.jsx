import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, CreditCard, Calendar, Eye, Home, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { reservationService } from '../../services/reservationService';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const ReservationSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, reloadUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [product, setProduct] = useState(null);

  const sessionId = searchParams.get('session_id');
  const productId = searchParams.get('product_id');

  useEffect(() => {
    const verifyAndCreateReservation = async () => {
      console.log('🔄 Starting reservation verification process...');
      console.log('URL params:', { sessionId, productId });

      if (!sessionId || !productId) {
        console.error(' Missing required parameters:', { sessionId, productId });
        setError('معلومات الجلسة أو المنتج مفقودة. يرجى التأكد من الرابط.');
        setLoading(false);
        return;
      }

      try {
        console.log('📞 Calling verifyPaymentAndCreateReservationPublic...');
        const response = await reservationService.verifyPaymentAndCreateReservationPublic({
          sessionId,
          productId
        });

        console.log('✅ Reservation verification response:', response);
        
        const reservationData = response.data?.reservation || response.reservation || response.data;
        if (!reservationData) {
          throw new Error('لم يتم العثور على بيانات الحجز في الاستجابة');
        }
        
        setReservation(reservationData);

        try {
          console.log('📦 Fetching product details...');
          const productData = await productService.getProductById(productId);
          console.log('📦 Product data fetched:', productData);
          setProduct(productData);
        } catch (productError) {
          console.warn('⚠️ Could not fetch product details:', productError);
        }

        if (user && reloadUser) {
          try {
            await reloadUser();
            console.log('👤 User data reloaded');
          } catch (reloadError) {
            console.warn('⚠️ Could not reload user data:', reloadError);
          }
        }

      } catch (error) {
        console.error('❌ Error in reservation process:', error);
        
        let errorMessage = 'حدث خطأ أثناء إنشاء الحجز';
        
        if (error.message.includes('Session ID and Product ID are required')) {
          errorMessage = 'معلومات الجلسة أو المنتج مفقودة';
        } else if (error.message.includes('Invalid session ID')) {
          errorMessage = 'معرف الجلسة غير صالح';
        } else if (error.message.includes('Payment not completed')) {
          errorMessage = 'لم يتم إكمال عملية الدفع بنجاح';
        } else if (error.message.includes('Customer email not found')) {
          errorMessage = 'لم يتم العثور على بريد إلكتروني في جلسة الدفع';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'لم يتم العثور على المستخدم. يرجى التأكد من تسجيل الدخول بنفس البريد الإلكتروني المستخدم في الدفع.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyAndCreateReservation();
  }, [sessionId, productId, user, reloadUser]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0.00';
    
    let numericPrice;
    if (typeof price === 'object' && price.$numberDecimal) {
      numericPrice = parseFloat(price.$numberDecimal);
    } else if (typeof price === 'string') {
      numericPrice = parseFloat(price);
    } else if (typeof price === 'number') {
      numericPrice = price;
    } else {
      return '0.00';
    }
    
    if (isNaN(numericPrice)) {
      return '0.00';
    }
    
    return numericPrice.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">جاري إنشاء الحجز...</h2>
          <p className="text-gray-600">يرجى الانتظار بينما نقوم بتأكيد حجزك</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('تسجيل الدخول') || error.includes('المستخدم');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            {/* <div className="text-6xl mb-4">{isAuthError ? '🔐' : ''}</div> */}
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {isAuthError ? 'مشكلة في المستخدم' : 'خطأ في إنشاء الحجز'}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            {isAuthError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  💡 <strong>نصيحة:</strong> تأكد من تسجيل الدخول بنفس البريد الإلكتروني المستخدم في عملية الدفع.
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              {isAuthError && (
                <Button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  🔑 تسجيل الدخول
                </Button>
              )}
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  إعادة المحاولة
                </Button>
                <Button
                  onClick={() => navigate(ROUTES.HOME)}
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  العودة للرئيسية
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">تم الحجز بنجاح! </h1>
          <p className="text-gray-600 text-lg">تم دفع 10% من قيمة المنتج وحجزه لمدة 7 أيام</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Package className="w-6 h-6 mr-2" />
              تفاصيل المنتج المحجوز
            </h2>
            
            <div className="flex items-start gap-4 mb-6">
              {product?.logoUrl && (
                <img
                  src={product.logoUrl}
                  alt={product.name || product.title || 'منتج ذهبي'}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {product?.name || product?.title || reservation?.productId?.name || reservation?.productId?.title || 'منتج ذهبي'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {product?.description || reservation?.productId?.description || 'لا توجد تفاصيل متاحة'}
                </p>
                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  {(product?.karat || reservation?.productId?.karat) && (
                    <p>العيار: {formatPrice(product?.karat || reservation?.productId?.karat)}</p>
                  )}
                  {(product?.weight || reservation?.productId?.weight) && (
                    <p>الوزن: {formatPrice(product?.weight || reservation?.productId?.weight)} جرام</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              تفاصيل الحجز والدفع
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">إجمالي سعر المنتج:</span>
                <span className="font-bold text-lg">
                  {reservation?.totalAmount ? formatPrice(reservation.totalAmount) : '---'} جنيه
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700">المبلغ المدفوع (10%):</span>
                <span className="font-bold text-lg text-green-600">
                  {reservation?.reservationAmount ? formatPrice(reservation.reservationAmount) : '---'} جنيه
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-700">المبلغ المتبقي:</span>
                <span className="font-bold text-lg text-blue-600">
                  {reservation?.remainingAmount ? formatPrice(reservation.remainingAmount) : '---'} جنيه
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            معلومات مهمة عن حجزك
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">تم حجز المنتج لمدة 7 أيام</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">يُدفع المبلغ المتبقي عند الاستلام</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">يمكنك إلغاء الحجز في أي وقت</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <strong>تاريخ الحجز:</strong> {reservation?.reservationDate ? formatDate(reservation.reservationDate) : '---'}
              </div>
              <div className="text-sm text-gray-600">
                <strong>تاريخ انتهاء الحجز:</strong> {reservation?.expiryDate ? formatDate(reservation.expiryDate) : '---'}
              </div>
              <div className="text-sm text-gray-600">
                <strong>رقم الحجز:</strong> {reservation?.id || reservation?._id || '---'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            onClick={() => navigate('/my-reservations')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
          >
            <Eye className="w-5 h-5 mr-2" />
            عرض جميع حجوزاتي
          </Button>

          <Button
            onClick={() => navigate(ROUTES.PRODUCTS)}
            variant="outline"
            className="px-8 py-3"
          >
            <Package className="w-5 h-5 mr-2" />
            تصفح المزيد من المنتجات
          </Button>

          <Button
            onClick={() => navigate(ROUTES.HOME)}
            variant="outline"
            className="px-8 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReservationSuccess;

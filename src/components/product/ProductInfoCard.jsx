import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  Star,
  Calendar,
  MessageSquare,
  ShoppingBag,
  Shield,
  Truck,
  RefreshCw,
  Verified,
  CreditCard,
  Bookmark
} from 'lucide-react';
import { reservationService } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const ProductInfoCard = ({
  product,
  shop,
  user,
  isFavorited,
  setIsFavorited,
  onOpenChat,
  onBookAppointment,
  onVisitShop,
  onAddToFavorites
}) => {
  const [quantity, setQuantity] = useState(1);
  const [reservationLoading, setReservationLoading] = useState(false);
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // Format price safely
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '0.00';
  };

  // حساب مبلغ الحجز (10%)
  const reservationAmount = reservationService.calculateReservationAmount(product.price);

  // معالجة الحجز
  const handleReservation = () => {
    if (!authUser) {
      navigate(ROUTES.LOGIN);
      return;
    }

    // التوجه إلى صفحة دفع الحجز مع بيانات المنتج
    navigate('/reservation-payment', {
      state: {
        product,
        reservationData: {
          productId: product._id || product.id,
          amount: reservationAmount.reservationAmount
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 lg:p-6 border border-secondary-2 shadow-sm font-cairo h-fit">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-success-500 text-white border-success-500 text-xs">
              {product.availability || 'متوفر'}
            </Badge>
            <span className="text-xs text-secondary-700 font-cairo">SKU: {product.sku}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary-900 mb-2 leading-tight font-cairo">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-secondary-800 font-cairo">
            <span>من</span>
            <span
              className="font-semibold text-primary-500 cursor-pointer hover:underline"
              onClick={onVisitShop}
            >
              {product.shopName || 'متجر غير معروف'}
            </span>
            {shop?.verified && (
              <Verified className="w-4 h-4 text-blue-500" />
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddToFavorites}
          className="flex-shrink-0 hover:bg-red-50 p-2"
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </Button>
      </div>

      {/* Rating and Reviews */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-base font-bold text-gray-900">
            {product.rating ? product.rating.toFixed(1) : '0.0'}
          </span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-gray-600 text-sm">{product.reviewCount || 0} تقييم</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="text-gray-600 text-sm">{product.soldCount || 0} مُباع</span>
      </div>

      {/* Price */}
      <div className="mb-5">
         <div className="flex items-baseline gap-3 mb-1">
          <span className="text-2xl lg:text-3xl font-bold text-gray-900">
            {formatPrice(product.price)} جنيه
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-lg text-gray-500 line-through">
              {formatPrice(product.originalPrice)} جنيه
            </span>
          )}
        </div>
        {product.originalPrice && product.originalPrice > product.price && (
          <p className="text-green-600 font-semibold text-sm">
            وفر {formatPrice(product.originalPrice - product.price)} جنيه
          </p>
        )}
        <p className="text-xs text-gray-600 mt-1">
          {product.stock && typeof product.stock === 'number'
            ? `متبقي ${product.stock} فقط في المخزون`
            : 'متبقي القليل في المخزون'
          }
        </p>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-3 mb-5">
        <span className="font-semibold text-gray-700 text-sm">الكمية:</span>
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-gray-50 transition-colors text-sm"
          >
            -
          </button>
          <span className="px-3 py-2 min-w-[40px] text-center border-x border-gray-200 text-sm">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
            className="p-2 hover:bg-gray-50 transition-colors text-sm"
          >
            +
          </button>
        </div>
      </div>

      {/* Reservation Info */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-4 h-4 text-green-600" />
          <h3 className="font-bold text-green-800 text-sm">احجز المنتج الآن</h3>
        </div>
        <p className="text-green-700 text-xs mb-2">
          ادفع {reservationAmount.reservationAmount} جنيه فقط (10%) واحتفظ بالمنتج لمدة 7 أيام
        </p>
        <div className="text-xs text-green-600 space-y-1">
          <p>• المبلغ المتبقي: {reservationAmount.remainingAmount} جنيه</p>
          <p>• يُدفع عند الاستلام</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* زر الحجز الجديد */}
        <Button
          size="lg"
          onClick={handleReservation}
          disabled={reservationLoading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all duration-300"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {reservationLoading ? 'جاري المعالجة...' : `ادفع ${reservationAmount.reservationAmount} جنيه واحجز المنتج`}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            onClick={onBookAppointment}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 rounded-xl font-bold text-sm transition-all duration-300"
          >
            <Calendar className="w-4 h-4 mr-2" />
            حجز موعد
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onOpenChat}
            className="border-2 border-blue-400 text-blue-700 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-800 py-3 rounded-xl font-bold text-sm transition-all duration-300"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            دردشة الآن
          </Button>
        </div>

        <Button
          size="lg"
          variant="outline"
          onClick={onVisitShop}
          className="w-full border-2 border-gray-300 hover:border-gray-400 py-3 rounded-xl font-bold text-sm"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          زيارة المتجر
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">
        <div className="text-center">
          <Shield className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-gray-700">دفع آمن</p>
        </div>
        <div className="text-center">
          <Truck className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-gray-700">شحن مجاني</p>
        </div>
        <div className="text-center">
          <RefreshCw className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-gray-700">إرجاع خلال 30 يوم</p>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoCard;
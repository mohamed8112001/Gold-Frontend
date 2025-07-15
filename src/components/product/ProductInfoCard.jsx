import React, { useState } from 'react';
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
  Verified
} from 'lucide-react';

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

  // Format price safely
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return '0.00';
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              {product.availability || 'Available'}
            </Badge>
            <span className="text-sm text-gray-500">SKU: {product.sku}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>by</span>
            <span 
              className="font-semibold text-yellow-600 cursor-pointer hover:underline"
              onClick={onVisitShop}
            >
              {product.shopName || 'Unknown Shop'}
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
          className="flex-shrink-0 hover:bg-red-50"
        >
          <Heart className={`w-6 h-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </Button>
      </div>

      {/* Rating and Reviews */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-bold text-gray-900">
            {product.rating ? product.rating.toFixed(1) : '0.0'}
          </span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-gray-600">{product.reviewCount || 0} reviews</span>
        <Separator orientation="vertical" className="h-6" />
        <span className="text-gray-600">{product.soldCount || 0} sold</span>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-4 mb-2">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(product.price)} EGP
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xl text-gray-500 line-through">
              {formatPrice(product.originalPrice)} EGP
            </span>
          )}
        </div>
        {product.originalPrice && product.originalPrice > product.price && (
          <p className="text-green-600 font-semibold">
            Save {formatPrice(product.originalPrice - product.price)} EGP
          </p>
        )}
        <p className="text-sm text-gray-600 mt-1">
          Only {product.stock || 'few'} left in stock
        </p>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-4 mb-8">
        <span className="font-semibold text-gray-700">Quantity:</span>
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-3 hover:bg-gray-50 transition-colors"
          >
            -
          </button>
          <span className="px-4 py-3 min-w-[50px] text-center border-x border-gray-200">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
            className="p-3 hover:bg-gray-50 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            onClick={onBookAppointment}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Appointment
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onOpenChat}
            className="border-2 border-blue-400 text-blue-700 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-800 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat Now
          </Button>
        </div>
        
        <Button
          size="lg"
          variant="outline"
          onClick={onVisitShop}
          className="w-full border-2 border-gray-300 hover:border-gray-400 py-4 rounded-2xl font-bold text-lg"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Visit Shop
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
        <div className="text-center">
          <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">Secure Payment</p>
        </div>
        <div className="text-center">
          <Truck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">Free Shipping</p>
        </div>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">30-Day Return</p>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoCard;
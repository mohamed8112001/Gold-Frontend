import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';

const ProductCard = ({ product, showStore = false }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    id,
    name,
    description,
    price,
    originalPrice,
    discount,
    category,
    images,
    rating,
    reviewsCount,
    inStock,
    weight,
    material
  } = product;

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
      <div className="relative">
        {/* الصورة */}
        <div 
          className="relative h-64 bg-gray-100 overflow-hidden"
          onMouseEnter={() => {
            if (images.length > 1) {
              setCurrentImageIndex(1);
            }
          }}
          onMouseLeave={() => setCurrentImageIndex(0)}
        >
          <img
            src={images[currentImageIndex] || images[0]}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* شارة الخصم */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
              -{discount}%
            </div>
          )}

          {/* أيقونة المفضلة */}
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>

          {/* حالة المخزون */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">غير متوفر</span>
            </div>
          )}

          {/* أزرار التفاعل عند التمرير */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link to={`/product/${id}`}>
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            {inStock && (
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                <ShoppingCart className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* الفئة */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
              {category}
            </span>
            {/* التقييم */}
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm text-gray-600">{rating}</span>
              <span className="text-xs text-gray-500">({reviewsCount})</span>
            </div>
          </div>

          {/* اسم المنتج */}
          <Link to={`/product/${id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-amber-600 transition-colors line-clamp-2">
              {name}
            </h3>
          </Link>

          {/* الوصف */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>

          {/* المواصفات */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span>{weight}</span>
            <span>•</span>
            <span>{material}</span>
          </div>

          {/* السعر */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {originalPrice > price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* زر الإضافة للسلة */}
          <Button 
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            disabled={!inStock}
          >
            {inStock ? 'أضف للسلة' : 'غير متوفر'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;


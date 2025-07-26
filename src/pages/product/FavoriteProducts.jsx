import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Heart, Star, ShoppingBag, Eye, X, Plus, Grid, List } from 'lucide-react';
import { productService } from '../../services/productService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import { translateProductCategory } from '../../lib/utils.js';
import { toast } from 'react-hot-toast';

const FavoriteProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadFavoriteProducts();
  }, [user]);

  const loadFavoriteProducts = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await productService.getFavorites(user._id);
      let products = [];
      if (response?.data?.favorites) {
        products = response.data.favorites;
      } else if (response?.data) {
        products = Array.isArray(response.data) ? response.data : [];
      } else if (response?.favorites) {
        products = response.favorites;
      } else if (Array.isArray(response)) {
        products = response;
      }
      const validProducts = products
        .filter(item => item && item.product && typeof item.product === 'object')
        .map(item => {
          const cleanValue = (value) => {
            if (value === null || value === undefined) return null;
            if (typeof value === 'object' && value.$numberDecimal) {
              return parseFloat(value.$numberDecimal);
            }
            if (typeof value === 'object' && value.$oid) {
              return value.$oid;
            }
            return value;
          };
          const cleanedProduct = {};
          for (const [key, value] of Object.entries(item.product)) {
            cleanedProduct[key] = cleanValue(value);
          }
          return {
            ...cleanedProduct,
            favoriteId: item._id,
            addedAt: item.addedAt,
          };
        });
      setFavoriteProducts(validProducts);
    } catch (error) {
      toast.error('فشل في تحميل المفضلة');
      setFavoriteProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId, e) => {
    e.stopPropagation();
    try {
      await productService.removeFromFavorites(favoriteId);
      setFavoriteProducts(prev => prev.filter(p => p.favoriteId !== favoriteId));
      toast.success('تمت الإزالة من المفضلة');
    } catch (error) {
      toast.error('فشل في إزالة المنتج من المفضلة');
    }
  };

  const ProductCard = ({ product }) => {
    if (!product) return null;
    const safeNumber = (value) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') return parseFloat(value) || 0;
      if (value && typeof value === 'object' && value.$numberDecimal) {
        return parseFloat(value.$numberDecimal) || 0;
      }
      return 0;
    };
    const safeString = (value) => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      if (typeof value === 'object') return '';
      return String(value);
    };
    const safeProduct = {
      id: safeString(product.id || product._id || 'unknown'),
      name: safeString(product.name || product.title || product.productName || 'منتج بدون اسم'),
      description: safeString(product.description || product.desc || product.productDescription || 'لا يوجد وصف متاح'),
      image: safeString(product.logoUrl || product.image || product.imageUrl || product.images?.[0] || product.productImage || ''),
      rating: safeNumber(product.rating || product.averageRating) || 4.5,
      reviewCount: safeNumber(product.reviewCount || product.reviews?.length || product.ratingsCount) || 0,
      shopName: safeString(product.shopName || product.shop?.name || product.storeName || 'متجر غير معروف'),
      shopId: safeString(product.shopId || product.shop?.id || product.shop?._id || product.storeId || ''),
      category: safeString(product.category || product.design_type || product.productCategory || 'other'),
      price: safeNumber(product.price || product.productPrice),
      favoriteId: safeString(product.favoriteId || product._id),
    };
    return (
      <Card
        className={`group hover:shadow-2xl hover:shadow-[#C37C00]/10 hover:border-[#C37C00]/50 hover:scale-[1.02] transition-all duration-500 cursor-pointer border border-gray-200/80 rounded-3xl overflow-hidden flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'} bg-white/95 backdrop-blur-sm shadow-lg shadow-gray-200/50`}
        onClick={() => navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id))}
        aria-label={`عرض تفاصيل ${safeProduct.name}`}
        dir="rtl"
      >
        <div className={`${viewMode === 'grid' ? 'h-72' : 'w-1/3 h-64'} relative overflow-hidden ${viewMode === 'grid' ? 'rounded-t-3xl' : 'rounded-l-3xl'}`}>
          {safeProduct.image && safeProduct.image !== '/placeholder-product.jpg' ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${safeProduct.image}`}
              alt={safeProduct.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
              onError={(e) => (e.target.style.display = 'none')}
            />
          ) : (
            <div className="fallback-image absolute inset-0 bg-gradient-to-br from-[#F8F4ED] via-[#F0E8DB] to-[#E8DCC6] flex items-center justify-center group-hover:from-[#F0E8DB] group-hover:via-[#E8DCC6] group-hover:to-[#DCC8B0] transition-all duration-500">
              <div className="text-center">
                <div className="text-7xl mb-4 animate-pulse">💎</div>
                <div className="text-sm text-gray-700 font-semibold px-4 py-2 bg-white/95 rounded-2xl border border-gray-200/80 shadow-lg">
                  {safeProduct.name.length > 25 ? safeProduct.name.substring(0, 25) + '...' : safeProduct.name}
                </div>
              </div>
            </div>
          )}
          {/* زر إزالة من المفضلة */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-4 right-4 bg-white/95 hover:bg-red-50 rounded-full w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={(e) => handleRemoveFavorite(safeProduct.favoriteId, e)}
            aria-label={`إزالة ${safeProduct.name} من المفضلة`}
          >
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </Button>
          {/* شارة التصنيف */}
          {safeProduct.category && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white px-4 py-2 text-xs font-bold rounded-2xl opacity-90 group-hover:opacity-100 transition-all duration-300 shadow-lg">
              {translateProductCategory(safeProduct.category, (key) => {
                const categories = {
                  rings: 'خواتم',
                  necklaces: 'عقود',
                  bracelets: 'أساور',
                  earrings: 'أقراط',
                  chains: 'سلاسل',
                  pendants: 'معلقات',
                  sets: 'طقم',
                  watches: 'ساعات',
                  other: 'أخرى',
                };
                return categories[key?.toLowerCase()] || key || 'غير معروف';
              })}
            </Badge>
          )}
          {/* تقييم المنتج */}
          {safeProduct.rating > 0 && (
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#C37C00] text-[#C37C00]" />
                <span className="text-sm font-bold text-gray-800">{safeProduct.rating}</span>
                {safeProduct.reviewCount > 0 && (
                  <span className="text-xs text-gray-600">({safeProduct.reviewCount})</span>
                )}
              </div>
            </div>
          )}
        </div>
        <CardContent className={`p-8 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-col w-2/3'} flex-1`} dir="rtl">
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-4 group-hover:text-[#C37C00] transition-colors duration-300 line-clamp-2 leading-tight">
              {safeProduct.name}
            </h3>
            {safeProduct.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {safeProduct.description}
              </p>
            )}
            {safeProduct.shopName && safeProduct.shopName !== 'متجر غير معروف' && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50/80 rounded-2xl">
                <ShoppingBag className="w-5 h-5 text-[#C37C00] flex-shrink-0" />
                <p
                  className="text-sm font-medium text-gray-700 hover:text-[#C37C00] cursor-pointer truncate transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (safeProduct.shopId) navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                  }}
                  aria-label={`زيارة ${safeProduct.shopName}`}
                >
                  {safeProduct.shopName}
                </p>
              </div>
            )}
            {safeProduct.price > 0 && (
              <div className="mb-6">
                <p className="text-3xl font-bold text-[#C37C00] mb-1">
                  {safeProduct.price.toLocaleString()} ج.م
                </p>
                <p className="text-sm text-gray-500">السعر</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 mt-6">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-2xl py-3 transition-all duration-300 font-bold text-base shadow-lg hover:shadow-xl hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id));
              }}
              aria-label={`عرض تفاصيل ${safeProduct.name}`}
            >
              <Eye className="w-5 h-5 ml-3" />
              عرض التفاصيل
            </Button>
            <div className="flex gap-3">
              {safeProduct.shopId && safeProduct.shopName !== 'متجر غير معروف' && (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-2 border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-2xl py-3 transition-all duration-300 font-bold text-base hover:scale-105"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                  }}
                  aria-label={`زيارة ${safeProduct.shopName}`}
                >
                  <ShoppingBag className="w-5 h-5 ml-2" />
                  المتجر
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                className="flex-1 border-2 border-red-400 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl py-3 transition-all duration-300 font-bold text-base hover:scale-105"
                onClick={(e) => handleRemoveFavorite(safeProduct.favoriteId, e)}
                aria-label={`إزالة ${safeProduct.name} من المفضلة`}
              >
                <X className="w-5 h-5 ml-2" />
                إزالة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB] pt-20 w-full" dir="rtl">
      {/* حاوية بعرض كامل */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        {/* العنوان */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                المنتجات المفضلة
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-[#C37C00] to-[#A66A00] mx-auto rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8 text-lg">
            {Array.isArray(favoriteProducts) && favoriteProducts.length > 0
              ? `لديك ${favoriteProducts.length} منتج في المفضلة`
              : 'احفظ المنتجات المفضلة لديك لتظهر هنا'}
          </p>
          {/* أدوات التحكم */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/80 p-6 shadow-lg">
            <div className="flex items-center gap-6">
              <Badge className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white px-6 py-3 text-base font-bold rounded-2xl shadow-lg">
                <ShoppingBag className="w-5 h-5 ml-3" />
                {Array.isArray(favoriteProducts) ? favoriteProducts.length : 0} مفضلة
              </Badge>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.PRODUCTS)}
                className="px-6 py-3 text-base border-2 border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-2xl transition-all duration-300 font-bold hover:scale-105 shadow-lg"
                aria-label="تصفح المزيد من المنتجات"
              >
                <Plus className="w-5 h-5 ml-3" />
                تصفح المزيد من المنتجات
              </Button>
            </div>
            <div className="flex border-2 border-[#C37C00]/30 rounded-2xl overflow-hidden bg-gray-50/80 shadow-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setViewMode('grid')}
                className={`px-6 py-3 text-base font-bold transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white shadow-lg' : 'text-[#C37C00] hover:bg-[#C37C00]/10'}`}
                aria-label="عرض شبكة"
              >
                <Grid className="w-5 h-5 ml-3" />
                شبكة
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setViewMode('list')}
                className={`px-6 py-3 text-base font-bold transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white shadow-lg' : 'text-[#C37C00] hover:bg-[#C37C00]/10'}`}
                aria-label="عرض قائمة"
              >
                <List className="w-5 h-5 ml-3" />
                قائمة
              </Button>
            </div>
          </div>
        </div>
        {/* المحتوى */}
        <div className="w-full">
          {isLoading ? (
            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
              {[...Array(10)].map((_, index) => (
                <div key={index} className="animate-pulse bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/80 overflow-hidden flex flex-col h-full shadow-lg">
                  <div className="bg-gray-200 h-72"></div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="h-6 bg-gray-200 rounded-2xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded-2xl mb-6 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded-2xl mb-6 w-1/2"></div>
                    <div className="mt-auto pt-4 space-y-4">
                      <div className="h-12 bg-gray-200 rounded-2xl"></div>
                      <div className="flex gap-3">
                        <div className="h-12 bg-gray-200 rounded-2xl flex-1"></div>
                        <div className="h-12 bg-gray-200 rounded-2xl flex-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !Array.isArray(favoriteProducts) || favoriteProducts.length === 0 ? (
            <div className="text-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/80 shadow-2xl">
              <div className="text-9xl mb-8 animate-pulse">❤️</div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                لا يوجد منتجات مفضلة بعد
              </h3>
              <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-xl leading-relaxed">
                يمكنك حفظ المنتجات المفضلة لديك من خلال الضغط على أيقونة القلب بجانب أي منتج
              </p>
              <Button
                onClick={() => navigate(ROUTES.PRODUCTS)}
                className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-10 py-4 rounded-3xl transition-all duration-300 font-bold text-xl shadow-2xl hover:scale-105"
                aria-label="تصفح المنتجات"
              >
                <Plus className="w-6 h-6 ml-3" />
                تصفح المنتجات
              </Button>
            </div>
          ) : (
            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
              {favoriteProducts.map((product, index) => (
                <ProductCard
                  key={product.id || product._id || product.favoriteId || index}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoriteProducts;
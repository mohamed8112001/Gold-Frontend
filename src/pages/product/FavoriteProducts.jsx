import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Heart, Star, ShoppingBag, Eye, X, Plus, Grid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/productService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, PRODUCT_CATEGORIES } from '../../utils/constants.js';
import { toast } from 'react-hot-toast';

const FavoriteProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
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
      toast.error(t('messages.failed_to_load') || 'Failed to load favorites');
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
      toast.success(t('messages.removed_from_favorites') || 'Removed from favorites');
    } catch (error) {
      toast.error(t('messages.failed_to_remove') || 'Failed to remove favorite');
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
      name: safeString(product.name || product.title || product.productName || 'Untitled Product'),
      description: safeString(product.description || product.desc || product.productDescription || 'No description available'),
      image: safeString(product.logoUrl || product.image || product.imageUrl || product.images?.[0] || product.productImage || ''),
      rating: safeNumber(product.rating || product.averageRating) || 4.5,
      reviewCount: safeNumber(product.reviewCount || product.reviews?.length || product.ratingsCount) || 0,
      shopName: safeString(product.shopName || product.shop?.name || product.storeName || 'Unknown Shop'),
      shopId: safeString(product.shopId || product.shop?.id || product.shop?._id || product.storeId || ''),
      category: safeString(product.category || product.design_type || product.productCategory || 'other'),
      price: safeNumber(product.price || product.productPrice),
      favoriteId: safeString(product.favoriteId || product._id),
    };

    return (
      <Card
        className={`group hover:border-[#C37C00]/50 hover:bg-gray-50/50 transition-all duration-300 cursor-pointer border border-gray-200 rounded-2xl overflow-hidden flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'} bg-white`}
        onClick={() => navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id))}
        aria-label={`View details for ${safeProduct.name}`}
      >
        <div className={`${viewMode === 'grid' ? 'h-64' : 'w-1/3 h-52'} relative overflow-hidden ${viewMode === 'grid' ? 'rounded-t-2xl' : 'rounded-l-2xl'}`}>
          {safeProduct.image && safeProduct.image !== '/placeholder-product.jpg' ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${safeProduct.image}`}
              alt={safeProduct.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => (e.target.style.display = 'none')}
            />
          ) : (
            <div className="fallback-image absolute inset-0 bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB] flex items-center justify-center group-hover:from-[#F0E8DB] group-hover:to-[#E8DCC6] transition-all duration-300">
              <div className="text-center">
                <div className="text-6xl mb-3">💎</div>
                <div className="text-xs text-gray-700 font-medium px-3 py-1.5 bg-white/90 rounded-lg border border-gray-200">
                  {safeProduct.name.length > 20 ? safeProduct.name.substring(0, 20) + '...' : safeProduct.name}
                </div>
              </div>
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-4 right-4 bg-white/95 hover:bg-red-50 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={(e) => handleRemoveFavorite(safeProduct.favoriteId, e)}
            aria-label={`Remove ${safeProduct.name} from favorites`}
          >
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
          </Button>
          {safeProduct.category && (
            <Badge className="absolute top-4 left-4 bg-[#C37C00] text-white px-3 py-1 text-xs font-medium rounded-full opacity-90 group-hover:opacity-100 transition-all duration-300">
              {PRODUCT_CATEGORIES[safeProduct.category.toUpperCase()] || safeProduct.category}
            </Badge>
          )}
        </div>
        <CardContent className={`p-6 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-col w-2/3'} flex-1`}>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-3 group-hover:text-[#C37C00] transition-colors line-clamp-2 leading-tight">
              {safeProduct.name}
            </h3>
            {safeProduct.shopName && safeProduct.shopName !== 'Unknown Shop' && (
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-4 h-4 text-[#C37C00] flex-shrink-0" />
                <p
                  className="text-sm text-gray-600 hover:text-[#C37C00] cursor-pointer truncate"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (safeProduct.shopId) navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                  }}
                  aria-label={`Visit ${safeProduct.shopName}`}
                >
                  {safeProduct.shopName}
                </p>
              </div>
            )}

            {safeProduct.price > 0 && (
              <p className="text-xl font-bold text-[#C37C00] mb-4">
                ${safeProduct.price.toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              size="sm"
              className="w-full bg-[#C37C00] hover:bg-[#A66A00] text-white rounded-xl py-2.5 transition-all duration-300 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id));
              }}
              aria-label={`View details for ${safeProduct.name}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('buttons.view_details') || 'View Details'}
            </Button>
            <div className="flex gap-2">
              {safeProduct.shopId && safeProduct.shopName !== 'Unknown Shop' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-xl py-2 transition-all duration-300 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                  }}
                  aria-label={`Visit ${safeProduct.shopName}`}
                >
                  <ShoppingBag className="w-4 h-4 mr-1" />
                  Shop
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-red-400 text-red-600 hover:bg-red-500 hover:text-white rounded-xl py-2 transition-all duration-300 font-medium"
                onClick={(e) => handleRemoveFavorite(safeProduct.favoriteId, e)}
                aria-label={`Remove ${safeProduct.name} from favorites`}
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB] pt-20 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-14 h-14 bg-[#C37C00] rounded-full flex items-center justify-center">
              <Heart className="w-7 h-7 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('favorites.title') || 'My Favorite Products'}
              </h1>
              <div className="w-20 h-0.5 bg-[#C37C00] mx-auto rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            {Array.isArray(favoriteProducts) && favoriteProducts.length > 0
              ? t('favorites.count_message', { count: favoriteProducts.length }) || `You have ${favoriteProducts.length} saved favorites`
              : t('favorites.empty_message') || 'Save your favorite products to see them here'}
          </p>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-[#C37C00] text-white px-4 py-2 text-sm font-medium">
                <ShoppingBag className="w-4 h-4 mr-2" />
                {Array.isArray(favoriteProducts) ? favoriteProducts.length : 0} {t('favorites.favorites') || 'favorites'}
              </Badge>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.PRODUCTS)}
                className="px-4 py-2 text-sm border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-lg transition-all duration-300 font-medium"
                aria-label="Browse more products"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('buttons.browse_products') || 'Browse More Products'}
              </Button>
            </div>
            <div className="flex border border-[#C37C00]/30 rounded-lg overflow-hidden bg-gray-50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${viewMode === 'grid' ? 'bg-[#C37C00] text-white' : 'text-[#C37C00] hover:bg-[#C37C00]/10'}`}
                aria-label="Switch to grid view"
              >
                <Grid className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${viewMode === 'list' ? 'bg-[#C37C00] text-white' : 'text-[#C37C00] hover:bg-[#C37C00]/10'}`}
                aria-label="Switch to list view"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full">
          {isLoading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col h-full">
                  <div className="bg-gray-200 h-64"></div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="h-5 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded-lg mb-4 w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded-lg mb-4 w-1/2"></div>
                    <div className="mt-auto pt-3 space-y-3">
                      <div className="h-10 bg-gray-200 rounded-xl"></div>
                      <div className="flex gap-2">
                        <div className="h-9 bg-gray-200 rounded-xl flex-1"></div>
                        <div className="h-9 bg-gray-200 rounded-xl flex-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !Array.isArray(favoriteProducts) || favoriteProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <div className="text-8xl mb-6">❤️</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {t('favorites.no_favorites') || 'No favorites yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
                {t('favorites.save_instruction') || 'Save your favorite products by clicking the heart icon on any product'}
              </p>
              <Button
                onClick={() => navigate(ROUTES.PRODUCTS)}
                className="bg-[#C37C00] hover:bg-[#A66A00] text-white px-8 py-3 rounded-xl transition-all duration-300 font-medium text-lg"
                aria-label="Browse products"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('buttons.browse_products') || 'Browse Products'}
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
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
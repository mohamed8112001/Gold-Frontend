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
        className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md rounded-xl overflow-hidden flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'}`}
        onClick={() => navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id))}
        aria-label={`View details for ${safeProduct.name}`}
      >
        <div className={`${viewMode === 'grid' ? 'h-56' : 'w-1/3 h-48'} relative overflow-hidden rounded-t-xl`}>
          {safeProduct.image && safeProduct.image !== '/placeholder-product.jpg' ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${safeProduct.image}`}
              alt={safeProduct.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => (e.target.style.display = 'none')}
            />
          ) : (
            <div className="fallback-image absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-200 flex items-center justify-center group-hover:from-amber-200 group-hover:to-yellow-300 transition-all duration-300">
              <div className="text-center">
                <div className="text-5xl mb-2">💎</div>
                <div className="text-sm text-gray-800 font-semibold px-3 py-1 bg-white/80 rounded-lg backdrop-blur-sm">
                  {safeProduct.name}
                </div>
              </div>
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={(e) => handleRemoveFavorite(safeProduct.favoriteId, e)}
            aria-label={`Remove ${safeProduct.name} from favorites`}
          >
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </Button>
          {safeProduct.category && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white px-3 py-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">
              {PRODUCT_CATEGORIES[safeProduct.category.toUpperCase()] || safeProduct.category}
            </Badge>
          )}
        </div>
        <CardContent className={`p-4 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-col w-2/3'} flex-1`}>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-[#C37C00] transition-colors line-clamp-2">
            {safeProduct.name}
          </h3>
          {safeProduct.shopName && safeProduct.shopName !== 'Unknown Shop' && (
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-[#C37C00]" />
              <p
                className="text-sm text-gray-600 hover:text-[#C37C00] cursor-pointer"
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
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              {safeProduct.rating.toFixed(1)} ({safeProduct.reviewCount} {t('reviews') || 'reviews'})
            </span>
          </div>
          {safeProduct.price > 0 && (
            <p className="text-lg font-bold text-[#C37C00] mb-4">
              ${safeProduct.price.toFixed(2)}
            </p>
          )}
          <div className="mt-auto flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id));
              }}
              aria-label={`View details for ${safeProduct.name}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('buttons.view_details') || 'View Product Details'}
            </Button>
            <div className="flex gap-2">
              {safeProduct.shopId && safeProduct.shopName !== 'Unknown Shop' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00]/10 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                  }}
                  aria-label={`Visit ${safeProduct.shopName}`}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {t('buttons.visit_shop') || 'Visit Shop'}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-red-400 text-red-600 hover:bg-red-500 hover:text-white rounded-lg"
                onClick={(e) => handleRemoveFavorite(safeProduct.favoriteId, e)}
                aria-label={`Remove ${safeProduct.name} from favorites`}
              >
                <X className="w-4 h-4 mr-2" />
                {t('buttons.remove') || 'Remove'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB] pt-20 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Fixed Header Inside Content */}
        <div
          className="sticky top-0 z-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-6"
          aria-label="Favorites header"
        >
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center shadow-md">
                <Heart className="w-8 h-8 text-white fill-current" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {t('favorites.title') || 'My Favorite Products'}
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-[#C37C00] to-[#A66A00] mx-auto rounded-full"></div>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {Array.isArray(favoriteProducts) && favoriteProducts.length > 0
                ? t('favorites.count_message', { count: favoriteProducts.length }) || `You have ${favoriteProducts.length} saved favorites`
                : t('favorites.empty_message') || 'Save your favorite products to see them here'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white px-4 py-2 text-sm font-semibold shadow-md">
                <ShoppingBag className="w-4 h-4 mr-2" />
                {Array.isArray(favoriteProducts) ? favoriteProducts.length : 0} {t('favorites.favorites') || 'favorites'}
              </Badge>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.PRODUCTS)}
                className="px-4 py-2 text-sm border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-lg"
                aria-label="Browse more products"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('buttons.browse_products') || 'Browse More Products'}
              </Button>
            </div>
            <div className="flex border border-[#C37C00]/30 rounded-lg overflow-hidden bg-white shadow-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 text-sm ${viewMode === 'grid' ? 'bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white' : 'text-[#C37C00] hover:bg-[#C37C00]/10'}`}
                aria-label="Switch to grid view"
              >
                <Grid className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white' : 'text-[#C37C00] hover:bg-[#C37C00]/10'}`}
                aria-label="Switch to list view"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Content with padding to avoid overlap */}
        <div className="pt-4 w-full">
          {isLoading ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full">
                  <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-56"></div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-3 w-1/2"></div>
                    <div className="mt-auto pt-3">
                      <div className="flex gap-2">
                        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !Array.isArray(favoriteProducts) || favoriteProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t('favorites.no_favorites') || 'No favorites yet'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('favorites.save_instruction') || 'Save your favorite products by clicking the heart icon on any product'}
              </p>
              <Button
                onClick={() => navigate(ROUTES.PRODUCTS)}
                className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-6 py-3 rounded-lg"
                aria-label="Browse products"
              >
                {t('buttons.browse_products') || 'Browse Products'}
              </Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
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
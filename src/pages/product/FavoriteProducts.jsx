import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Heart, Star, ShoppingBag, Eye, X } from 'lucide-react';
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
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadFavoriteProducts = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const response = await productService.getFavorites(user._id);
            console.log('🔍 Full favorites response:', response);
            console.log('🔍 Response data:', response.data);

            // Handle different possible response structures
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

            console.log('🔍 Processed products:', products);
            console.log('🔍 First product sample:', products[0]);

            // Filter out null products and extract the actual product data
            const validProducts = products
                .filter(item => {
                    console.log('🔍 Filtering item:', item);
                    return item && item.product && typeof item.product === 'object';
                })
                .map(item => {
                    console.log('🔍 Mapping item:', item);

                    // Helper function to clean MongoDB objects
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

                    // Clean all product data
                    const cleanedProduct = {};
                    for (const [key, value] of Object.entries(item.product)) {
                        cleanedProduct[key] = cleanValue(value);
                    }

                    const productData = {
                        ...cleanedProduct, // Extract the cleaned product data
                        favoriteId: item._id, // Keep the favorite ID for removal
                        addedAt: item.addedAt
                    };
                    console.log('🔍 Mapped product data:', productData);
                    return productData;
                });

            console.log('🔍 Valid products after filtering:', validProducts);
            console.log('🔍 First valid product sample:', validProducts[0]);

            setFavoriteProducts(validProducts);
        } catch (error) {
            console.error('Error loading favorite products:', error);
            console.error('Error details:', error.response || error.message);
            toast.error('Failed to load favorites');
            setFavoriteProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFavorite = async (favoriteId, e) => {
        e.stopPropagation();
        try {
            // Use the favorite ID to remove from favorites
            await productService.removeFromFavorites(favoriteId);

            setFavoriteProducts(prev => prev.filter(p => p.favoriteId !== favoriteId));
            toast.success(t('messages.removed_from_favorites') || 'Removed from favorites');
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast.error(t('messages.failed_to_remove') || 'Failed to remove favorite');
        }
    };

    const ProductCard = ({ product }) => {
        // Debug the product data
        console.log('🔍 Product card data:', product);

        // Safety check
        if (!product) {
            console.error('🔍 Product is null or undefined');
            return null;
        }

        try {
            // Helper function to safely convert MongoDB Decimal128 to number
            const safeNumber = (value) => {
                if (value === null || value === undefined) return null;
                if (typeof value === 'number') return value;
                if (typeof value === 'string') return parseFloat(value) || 0;
                if (value && typeof value === 'object' && value.$numberDecimal) {
                    return parseFloat(value.$numberDecimal) || 0;
                }
                return 0;
            };

            // Helper function to safely convert values to strings
            const safeString = (value) => {
                if (value === null || value === undefined) return '';
                if (typeof value === 'string') return value;
                if (typeof value === 'object') return '';
                return String(value);
            };

            // The product data is already extracted from the nested structure
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
                favoriteId: safeString(product.favoriteId || product._id) // For removal
            };

            console.log('🔍 Safe product data:', safeProduct);

            return (
                <Card
                    className="group hover:shadow-2xl transition-all duration-700 cursor-pointer border-0 shadow-xl hover:shadow-3xl transform hover:-translate-y-4 hover:scale-105 h-full flex flex-col bg-white rounded-3xl overflow-hidden backdrop-blur-sm"
                    onClick={() => navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id))}
                >
                    <div className="relative overflow-hidden w-full h-64 rounded-t-3xl">
                        {/* Try to show real product image first */}
                        {safeProduct.image && safeProduct.image !== '/placeholder-product.jpg' ? (
                            <img
                                src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${safeProduct.image}`}
                                alt={safeProduct.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    console.log('❌ Product image failed to load:', e.target.src);
                                    e.target.style.display = 'none';
                                    const fallback = e.target.parentElement.querySelector('.fallback-image');
                                    if (fallback) {
                                        fallback.style.display = 'flex';
                                    }
                                }}
                            />
                        ) : null}

                        {/* Premium fallback image */}
                        <div className={`fallback-image absolute inset-0 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200 ${safeProduct.image && safeProduct.image !== '/placeholder-product.jpg' ? 'hidden' : 'flex'} items-center justify-center group-hover:from-yellow-200 group-hover:via-amber-100 group-hover:to-yellow-300 transition-all duration-700`}>
                            <div className="text-center transform group-hover:scale-110 transition-transform duration-700">
                                <div className="relative mb-4">
                                    <div className="text-6xl mb-2 filter drop-shadow-2xl">💎</div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-xl"></div>
                                </div>
                                <div className="text-sm text-gray-800 font-bold px-3 py-1 bg-white/90 rounded-xl backdrop-blur-md shadow-lg border border-yellow-300">
                                    {safeProduct.name}
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Premium remove favorite button */}
                        <Button
                            size="lg"
                            variant="ghost"
                            className="absolute top-4 right-4 bg-white/95 hover:bg-white shadow-2xl backdrop-blur-md rounded-full w-12 h-12 p-0 opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-125 border-2 border-white/70 z-20"
                            onClick={(e) => handleRemoveFavorite(safeProduct.favoriteId, e)}
                        >
                            <Heart className="w-5 h-5 fill-red-500 text-red-500 hover:text-red-600 transition-colors duration-200" />
                        </Button>

                        {/* Premium category badge */}
                        {safeProduct.category && (
                            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 text-white shadow-2xl px-4 py-2 text-sm font-bold border border-yellow-400/50 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 z-20">
                                {PRODUCT_CATEGORIES[safeProduct.category.toUpperCase()] || safeProduct.category}
                            </Badge>
                        )}

                        {/* Favorite badge */}
                        <div className="absolute bottom-4 right-4 z-20">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full shadow-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 border border-red-400/50">
                                ❤️ Favorite
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-8 flex flex-col h-full relative z-10">
                        <div className="flex-1">
                            <h3 className="font-bold text-2xl mb-4 group-hover:text-yellow-600 transition-colors line-clamp-2 leading-tight group-hover:scale-105 transform origin-left duration-300 ">
                                {safeProduct.name}
                            </h3>


                            {/* Enhanced shop information */}
                            {safeProduct.shopName && safeProduct.shopName !== 'Unknown Shop' && (
                                <div className="flex items-center gap-3 mb-6 bg-blue-50 p-3 rounded-xl border border-blue-200/50">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <ShoppingBag className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 font-medium">Available at</p>
                                        <p className="text-base font-bold text-blue-700 hover:text-blue-800 cursor-pointer transition-colors duration-200" onClick={(e) => {
                                            e.stopPropagation();
                                            if (safeProduct.shopId) {
                                                navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                                            }
                                        }}>
                                            {safeProduct.shopName}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Actions Section */}
                        <div className="mt-auto pt-6">
                            <div className="flex flex-col gap-3">
                                {/* Main View Product Button */}
                                <Button
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 hover:from-yellow-600 hover:via-orange-500 hover:to-orange-600 text-white px-6 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 font-bold text-base border border-yellow-400/50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id));
                                    }}
                                >
                                    <Eye className="w-5 h-5 mr-3" />
                                    {t('buttons.view_details') || 'View Product Details'}
                                </Button>

                                {/* Secondary Actions */}
                                <div className="flex gap-2">
                                    {safeProduct.shopId && safeProduct.shopName && safeProduct.shopName !== 'Unknown Shop' && (
                                        <Button
                                            variant="outline"
                                            size="md"
                                            className="flex-1 border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700 hover:text-blue-800 py-3 rounded-xl font-semibold transition-all duration-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                                            }}
                                        >
                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                            {t('buttons.visit_shop') || 'Visit Shop'}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="md"
                                        className="flex-1 border-2 border-red-300 hover:border-red-500 hover:bg-red-50 text-red-700 hover:text-red-800 py-3 rounded-xl font-semibold transition-all duration-300"
                                        onClick={(e) => handleRemoveFavorite(safeProduct.favoriteId, e)}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        {t('buttons.remove') || 'Remove'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        } catch (error) {
            console.error('🔍 Error rendering product card:', error);
            return (
                <Card className="p-4 border border-red-200 bg-red-50">
                    <p className="text-red-600">Error loading product</p>
                </Card>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">❤️</div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            {t('favorites.title') || 'Your Favorite Products'}
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {Array.isArray(favoriteProducts) && favoriteProducts.length > 0
                                ? t('favorites.count_message', { count: favoriteProducts.length }) || `You have ${favoriteProducts.length} saved favorites`
                                : t('favorites.empty_message') || "Save your favorite products to see them here"}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                    <span className="text-sm font-medium text-yellow-800">
                                        {Array.isArray(favoriteProducts) ? favoriteProducts.length : 0} {t('favorites.favorites') || 'favorites'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-none ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'hover:bg-gray-50'}`}
                                >
                                    Grid
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-none ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'hover:bg-gray-50'}`}
                                >
                                    List
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex gap-8">
                    <div className="flex-1">
                        {isLoading ? (
                            <div className={`grid gap-10 ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-1 max-w-5xl mx-auto'
                                }`}>
                                {[...Array(4)].map((_, index) => (
                                    <div key={index} className="animate-pulse bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
                                        <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-48"></div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-2"></div>
                                            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-3 w-3/4"></div>
                                            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-3 w-1/2"></div>
                                            <div className="mt-auto pt-3 border-t border-gray-200">
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
                            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                                <div className="text-8xl mb-6">❤️</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {t('favorites.no_favorites') || 'No favorites yet'}
                                </h3>
                                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                                    {t('favorites.save_instruction') || 'Save your favorite products by clicking the heart icon on any product'}
                                </p>
                                <Button
                                    onClick={() => navigate(ROUTES.PRODUCTS)}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3"
                                >
                                    Browse Products
                                </Button>
                            </div>
                        ) : (
                            <div className={`grid gap-10 ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-1 max-w-5xl mx-auto'
                                }`}>
                                {Array.isArray(favoriteProducts) && favoriteProducts.map((product, index) => {
                                    if (!product) {
                                        console.warn('🔍 Skipping null product at index:', index);
                                        return null;
                                    }
                                    return (
                                        <ProductCard
                                            key={product.id || product._id || product.favoriteId || index}
                                            product={product}
                                        />
                                    );
                                }).filter(Boolean)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FavoriteProducts;
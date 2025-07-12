import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Heart, Star, ShoppingBag, Eye, X } from 'lucide-react';
import { productService } from '../../services/productService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, PRODUCT_CATEGORIES } from '../../utils/constants.js';
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
            console.log(`response: ${response.data}`);
            
            // Handle different possible response structures
            const products = response?.data?.favorites || [];
            setFavoriteProducts(Array.isArray(products) ? products : []);
        } catch (error) {
            console.error('Error loading favorite products:', error);
            toast.error('Failed to load favorites');
            setFavoriteProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFavorite = async (productId, e) => {
        e.stopPropagation();
        try {
            await productService.removeFromFavorites(productId);

            setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
            toast.success('Removed from favorites');
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast.error('Failed to remove favorite');
        }
    };

    const ProductCard = ({ product }) => {
        const safeProduct = {
            id: product.id || product._id,
            name: product.name || product.title || 'Untitled Product',
            description: product.description || 'No description available',
            image: product.image || product.imageUrl || product.images?.[0] || '/placeholder-product.jpg',
            rating: typeof product.rating === 'number' ? product.rating : 4.5,
            reviewCount: product.reviewCount || product.reviews?.length || 0,
            shopName: product.shopName || product.shop?.name || 'Unknown Shop',
            shopId: product.shopId || product.shop?.id || product.shop?._id,
            category: product.category || product.design_type || 'other'
        };

        return (
            <Card
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-2xl transform hover:-translate-y-1 h-full flex flex-col"
                onClick={() => navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id))}
            >
                <div className="relative overflow-hidden w-full h-48">
                    <img
                        src={safeProduct.image}
                        alt={safeProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=منتج';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                        onClick={(e) => handleRemoveFavorite(safeProduct.id, e)}
                    >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>

                    {safeProduct.category && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
                            {PRODUCT_CATEGORIES[safeProduct.category.toUpperCase()] || safeProduct.category}
                        </Badge>
                    )}
                </div>

                <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2 leading-tight">
                            {safeProduct.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                            {safeProduct.description}
                        </p>

                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-semibold ml-1 text-yellow-700">
                                    {safeProduct.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">
                                    ({safeProduct.reviewCount})
                                </span>
                            </div>
                        </div>

                        {safeProduct.shopName && safeProduct.shopName !== 'Unknown Shop' && (
                            <div className="flex items-center gap-2 mb-4">
                                <ShoppingBag className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-600 font-medium truncate">
                                    by <span className="text-yellow-600 hover:text-yellow-700 cursor-pointer font-semibold" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (safeProduct.shopId) {
                                            navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                                        }
                                    }}>
                                        {safeProduct.shopName}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100">
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id));
                                }}
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                            </Button>
                            {safeProduct.shopId && safeProduct.shopName && safeProduct.shopName !== 'Unknown Shop' && (
                                <Button
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                                    }}
                                >
                                    <ShoppingBag className="w-3 h-3 mr-1" />
                                    Shop
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">❤️</div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            Your Favorite Products
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {Array.isArray(favoriteProducts) && favoriteProducts.length > 0 
                                ? `You have ${favoriteProducts.length} saved favorites`
                                : "Save your favorite products to see them here"}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                                                    <span className="text-sm font-medium text-yellow-800">
                                    {Array.isArray(favoriteProducts) ? favoriteProducts.length : 0} favorites
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
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1'
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
                                    No favorites yet
                                </h3>
                                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                                    Save your favorite products by clicking the heart icon on any product
                                </p>
                                <Button
                                    onClick={() => navigate(ROUTES.PRODUCTS)}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3"
                                >
                                    Browse Products
                                </Button>
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1 max-w-4xl mx-auto'
                                }`}>
                                {Array.isArray(favoriteProducts) && favoriteProducts.map((product) => (
                                    <ProductCard
                                        key={product.id || product._id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FavoriteProducts;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
    Heart,
    Star,
    ShoppingBag,
    Eye,
    Trash2,
    Grid,
    List
} from 'lucide-react';
import { productService } from '../../services/productService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, PRODUCT_CATEGORIES } from '../../utils/constants.js';

const Favorites = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        if (!user) {
            navigate(ROUTES.LOGIN);
            return;
        }
        loadFavorites();
    }, [user, navigate]);

    const loadFavorites = async () => {
        try {
            setIsLoading(true);
            const response = await productService.getFavorites(user.id);
            setFavorites(response.data || response);
        } catch (error) {
            console.error('Error loading favorites:', error);
            // Use mock data for demo
            setFavorites(mockFavorites);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFromFavorites = async (productId) => {
        try {
            await productService.removeFromFavorites(productId);
            setFavorites(prev => prev.filter(item => item.id !== productId));
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    const handleClearAllFavorites = async () => {
        if (window.confirm('هل أنت متأكد من حذف جميع المفضلة؟')) {
            try {
                // Remove all favorites one by one (if no bulk delete endpoint)
                for (const item of favorites) {
                    await productService.removeFromFavorites(item.id);
                }
                setFavorites([]);
            } catch (error) {
                console.error('Error clearing favorites:', error);
            }
        }
    };

    // Mock data for demo
    const mockFavorites = [
        {
            id: 1,
            name: 'خاتم ذهبي كلاسيكي',
            description: 'خاتم ذهب عيار 21 بتصميم كلاسيكي أنيق',
            price: 2500,
            category: 'rings',
            image: '/api/placeholder/300/300',
            rating: 4.5,
            reviewCount: 23,
            shopName: 'مجوهرات الإسكندرية',
            shopId: 1,
            addedToFavoritesAt: '2024-01-15'
        },
        {
            id: 2,
            name: 'سلسلة ذهبية فاخرة',
            description: 'سلسلة ذهب عيار 18 بتصميم عصري',
            price: 4200,
            category: 'chains',
            image: '/api/placeholder/300/300',
            rating: 4.8,
            reviewCount: 45,
            shopName: 'رويال جولد',
            shopId: 2,
            addedToFavoritesAt: '2024-01-10'
        },
        {
            id: 5,
            name: 'أقراط ذهبية مميزة',
            description: 'أقراط ذهب مرصعة بالألماس',
            price: 2800,
            category: 'earrings',
            image: '/api/placeholder/300/300',
            rating: 4.4,
            reviewCount: 27,
            shopName: 'رويال جولد',
            shopId: 2,
            addedToFavoritesAt: '2024-01-05'
        }
    ];

    const FavoriteCard = ({ product, isListView = false }) => (
        <Card className={`group hover:shadow-lg hover:shadow-[#A37F41]/20 transition-all duration-300 border-[#E2D2B6]/30 hover:border-[#A37F41]/50 bg-gradient-to-br from-white to-[#F8F4ED]/30 ${isListView ? 'flex' : ''}`}>
            <div className={`relative ${isListView ? 'w-48 flex-shrink-0' : ''}`}>
                <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${isListView ? 'h-full rounded-l-lg' : 'h-48 rounded-t-lg'
                        }`}
                />
                <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-[#F8F4ED] text-[#8A6C37] hover:text-[#6D552C] border border-[#E2D2B6]/50"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromFavorites(product.id);
                    }}
                >
                    <Heart className="w-4 h-4 fill-[#8A6C37]" />
                </Button>
                {product.category && (
                    <Badge className="absolute top-2 left-2 bg-[#A37F41] text-white">
                        {PRODUCT_CATEGORIES[product.category.toUpperCase()] || product.category}
                    </Badge>
                )}
            </div>

            <div className={`p-4 flex-1 ${isListView ? 'flex flex-col justify-between' : ''}`}>
                <div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-[#A37F41] transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 fill-[#A37F41] text-[#A37F41]" />
                            <span className="text-sm font-medium ml-1">{product.rating}</span>
                            <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                        في {product.shopName}
                    </p>

                    <p className="text-xs text-gray-500 mb-3">
                        أُضيف للمفضلة في {new Date(product.addedToFavoritesAt).toLocaleDateString('ar-EG')}
                    </p>
                </div>

                <div className={`flex items-center justify-between ${isListView ? 'mt-4' : ''}`}>
                    <div className="text-xl font-bold text-[#A37F41]">
                        {product.price.toLocaleString()} ج.م
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-[#E2D2B6] text-[#8A6C37] hover:bg-[#F8F4ED] hover:border-[#A37F41]"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(ROUTES.PRODUCT_DETAILS(product.id));
                            }}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            show
                        </Button>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white shadow-lg hover:shadow-[#C37C00]/30"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(ROUTES.SHOP_DETAILS(product.shopId));
                            }}
                        >
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            Shop
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A37F41] mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل المفضلة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">المفضلة</h1>
                        {favorites.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleClearAllFavorites}
                                className="text-[#8A6C37] hover:text-[#6D552C] hover:bg-[#F8F4ED] border-[#E2D2B6]"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                حذف الكل
                            </Button>
                        )}
                    </div>

                    {favorites.length > 0 && (
                        <div className="flex items-center justify-between">
                            <p className="text-gray-600">
                                {favorites.length} منتج في المفضلة
                            </p>

                            <div className="flex border border-[#E2D2B6] rounded-lg bg-white">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-r-none"
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-l-none"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Favorites Grid/List */}
                {favorites.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-8xl mb-6">💝</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            لا توجد منتجات في المفضلة
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            ابدأ في إضافة المنتجات التي تعجبك إلى المفضلة لتتمكن من العثور عليها بسهولة لاحقاً
                        </p>
                        <div className="space-y-4">
                            <Button
                                size="lg"
                                onClick={() => navigate(ROUTES.PRODUCTS)}
                                className="px-8 bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white shadow-lg hover:shadow-[#C37C00]/30"
                            >
                                تصفح المنتجات
                            </Button>
                            <br />
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate(ROUTES.SHOPS)}
                                className="px-8 border-[#E2D2B6] text-[#8A6C37] hover:bg-[#F8F4ED] hover:border-[#A37F41]"
                            >
                                تصفح المتاجر
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                        : 'grid-cols-1'
                        }`}>
                        {favorites.map((product) => (
                            <FavoriteCard
                                key={product.id}
                                product={product}
                                isListView={viewMode === 'list'}
                            />
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                {favorites.length > 0 && (
                    <div className="mt-12 text-center">
                        <Card className="max-w-md mx-auto bg-gradient-to-br from-white to-[#F8F4ED]/50 border-[#E2D2B6]/50">
                            <CardHeader>
                                <CardTitle>إجراءات سريعة</CardTitle>
                                <CardDescription>
                                    اكتشف المزيد من المنتجات والمتاجر
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    variant="outline"
                                    className="w-full border-[#E2D2B6] text-[#8A6C37] hover:bg-[#F8F4ED] hover:border-[#A37F41]"
                                    onClick={() => navigate(ROUTES.PRODUCTS)}
                                >
                                    تصفح المزيد من المنتجات
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-[#E2D2B6] text-[#8A6C37] hover:bg-[#F8F4ED] hover:border-[#A37F41]"
                                    onClick={() => navigate(ROUTES.SHOPS)}
                                >
                                    اكتشف متاجر جديدة
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};



export default Favorites;
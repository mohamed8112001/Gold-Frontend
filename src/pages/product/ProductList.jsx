import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
    Search,
    Filter,
    Grid,
    List,
    Heart,
    Star,
    ShoppingBag,
    Eye,
    SlidersHorizontal,
    X
} from 'lucide-react';
import { productService } from '../../services/productService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, PRODUCT_CATEGORIES } from '../../utils/constants.js';

const ProductList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        priceRange: '',
        rating: '',
        sortBy: 'newest'
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, searchQuery, filters]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const response = await productService.getAllProducts();
            const data = response.data || response;

            // Debug: Log products data to understand structure
            console.log('🔍 Products loaded:', data);
            if (data.length > 0) {
                console.log('🔍 Sample product:', data[0]);
                console.log('🔍 Product price:', data[0].price, typeof data[0].price);
                console.log('🔍 Product shop:', data[0].shopName || data[0].shop);
            }

            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
            // Use mock data for demo
            console.log('🔍 Using mock products for demo');
            setProducts(mockProducts);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter(product => product.category === filters.category);
        }

        // Price range filter
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            filtered = filtered.filter(product => {
                const price = product.price;
                return price >= min && (max ? price <= max : true);
            });
        }

        // Rating filter
        if (filters.rating) {
            const minRating = parseFloat(filters.rating);
            filtered = filtered.filter(product => (product.rating || 0) >= minRating);
        }

        // Sort
        switch (filters.sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default: // newest
                filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        setFilteredProducts(filtered);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(prev => {
            if (searchQuery) {
                prev.set('search', searchQuery);
            } else {
                prev.delete('search');
            }
            return prev;
        });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'category') {
            setSearchParams(prev => {
                if (value) {
                    prev.set('category', value);
                } else {
                    prev.delete('category');
                }
                return prev;
            });
        }
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            priceRange: '',
            rating: '',
            sortBy: 'newest'
        });
        setSearchQuery('');
        setSearchParams({});
    };

    const handleAddToFavorites = async (productId) => {
        if (!user) {
            navigate(ROUTES.LOGIN);
            return;
        }

        try {
            await productService.addToFavorites(productId);
            // Update local state to show favorited
            setProducts(prev => prev.map(product =>
                product.id === productId
                    ? { ...product, isFavorited: true }
                    : product
            ));
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };

    // Mock data for demo
    const mockProducts = [
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
            isFavorited: false,
            createdAt: '2024-01-15'
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
            isFavorited: true,
            createdAt: '2024-01-10'
        },
        {
            id: 3,
            name: 'أسورة ذهبية مرصعة',
            description: 'أسورة ذهب مرصعة بالأحجار الكريمة',
            price: 3800,
            category: 'bracelets',
            image: '/api/placeholder/300/300',
            rating: 4.3,
            reviewCount: 18,
            shopName: 'الماس الشرق',
            shopId: 3,
            isFavorited: false,
            createdAt: '2024-01-12'
        },
        {
            id: 4,
            name: 'قلادة ذهبية أنيقة',
            description: 'قلادة ذهب عيار 18 بتصميم راقي',
            price: 3200,
            category: 'necklaces',
            image: '/api/placeholder/300/300',
            rating: 4.6,
            reviewCount: 31,
            shopName: 'مجوهرات الإسكندرية',
            shopId: 1,
            isFavorited: false,
            createdAt: '2024-01-08'
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
            isFavorited: true,
            createdAt: '2024-01-05'
        },
        {
            id: 6,
            name: 'خاتم خطوبة فاخر',
            description: 'خاتم خطوبة ذهب أبيض مرصع بالألماس',
            price: 8500,
            category: 'rings',
            image: '/api/placeholder/300/300',
            rating: 4.9,
            reviewCount: 52,
            shopName: 'الماس الشرق',
            shopId: 3,
            isFavorited: false,
            createdAt: '2024-01-03'
        }
    ];

    const ProductCard = ({ product, isListView = false }) => {
        const productId = product.id || product._id;

        // Safe data extraction
        const safeProduct = {
            name: product.name || product.title || 'منتج غير محدد',
            description: product.description || 'لا يوجد وصف متاح',
            image: product.image || product.imageUrl || product.images?.[0] || '/api/placeholder/300/300',
            rating: typeof product.rating === 'number' ? product.rating : 0,
            reviewCount: product.reviewCount || product.reviews?.length || 0,
            shopName: product.shopName || product.shop?.name || 'متجر غير محدد',
            shopId: product.shopId || product.shop?.id || product.shop?._id,
            category: product.category || 'عام',
            isFavorited: product.isFavorited || false,
            price: (() => {
                let price = product.price;
                if (typeof price === 'object' && price !== null) {
                    price = price.value || price.amount || price.price || 0;
                }
                if (typeof price === 'string') {
                    price = parseFloat(price) || 0;
                }
                return typeof price === 'number' ? price : 0;
            })()
        };

        return (
            <Card
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-2xl transform hover:-translate-y-1 ${isListView ? 'flex h-48' : 'flex flex-col h-full'}`}
                onClick={() => navigate(ROUTES.PRODUCT_DETAILS(productId))}
            >
                <div className={`relative overflow-hidden ${isListView ? 'w-48 flex-shrink-0' : 'w-full'}`}>
                    <img
                        src={safeProduct.image}
                        alt={safeProduct.name}
                        className={`w-full object-cover group-hover:scale-110 transition-transform duration-500 ${isListView ? 'h-full' : 'h-48'}`}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=منتج';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(productId);
                        }}
                    >
                        <Heart className={`w-4 h-4 ${safeProduct.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </Button>

                    {safeProduct.category && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
                            {PRODUCT_CATEGORIES[safeProduct.category.toUpperCase()] || safeProduct.category}
                        </Badge>
                    )}

                    {safeProduct.price > 0 && (
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                            {safeProduct.price.toLocaleString()} ج.م
                        </div>
                    )}
                </div>

                <div className={`p-5 flex flex-col h-full ${isListView ? 'justify-between' : ''}`}>
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

                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-xs text-gray-600 font-medium truncate">
                                في <span className="text-yellow-600 hover:text-yellow-700 cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    if (safeProduct.shopId) {
                                        navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                                    }
                                }}>{safeProduct.shopName}</span>
                            </p>
                        </div>
                    </div>

                    {/* Price and Actions - Fixed at bottom */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-lg font-bold text-yellow-600 truncate">
                                {safeProduct.price > 0 ? `${safeProduct.price.toLocaleString()} ج.م` : 'غير محدد'}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(ROUTES.PRODUCT_DETAILS(productId));
                                }}
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                عرض
                            </Button>
                            {safeProduct.shopId && (
                                <Button
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                                    }}
                                >
                                    <ShoppingBag className="w-3 h-3 mr-1" />
                                    المتجر
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">
                            💎 معرض المنتجات 💎
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            اكتشف أجمل قطع المجوهرات والذهب من أفضل المتاجر في مصر
                        </p>
                    </div>

                    {/* Search and Controls */}
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white rounded-2xl p-6 shadow-lg">
                        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                                <div className="relative bg-white rounded-full border-2 border-gray-200 focus-within:border-yellow-400 transition-colors duration-300">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        type="text"
                                        placeholder="🔍 ابحث عن المنتجات، المجوهرات، الذهب..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-6 py-4 text-lg rounded-full border-0 focus:ring-0 bg-transparent placeholder-gray-500"
                                    />
                                    <Button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-2 rounded-full"
                                    >
                                        بحث
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                                <span className="text-sm font-medium text-gray-600">
                                    {filteredProducts.length} منتج
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                فلاتر
                                {Object.keys(filters).some(key => filters[key]) && (
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                )}
                            </Button>

                            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={`rounded-none ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'hover:bg-gray-50'}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={`rounded-none ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'hover:bg-gray-50'}`}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    {showFilters && (
                        <div className="w-64 flex-shrink-0">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">الفلاتر</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFilters(false)}
                                        className="lg:hidden"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Category Filter */}
                                    <div>
                                        <h3 className="font-medium mb-3">الفئة</h3>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value=""
                                                    checked={filters.category === ''}
                                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                                    className="mr-2"
                                                />
                                                الكل
                                            </label>
                                            {Object.entries(PRODUCT_CATEGORIES).map(([key, value]) => (
                                                <label key={key} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        value={key.toLowerCase()}
                                                        checked={filters.category === key.toLowerCase()}
                                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    {value}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range Filter */}
                                    <div>
                                        <h3 className="font-medium mb-3">السعر</h3>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'الكل', value: '' },
                                                { label: 'أقل من 1000 ج.م', value: '0-1000' },
                                                { label: '1000 - 3000 ج.م', value: '1000-3000' },
                                                { label: '3000 - 5000 ج.م', value: '3000-5000' },
                                                { label: 'أكثر من 5000 ج.م', value: '5000-' }
                                            ].map((option) => (
                                                <label key={option.value} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="priceRange"
                                                        value={option.value}
                                                        checked={filters.priceRange === option.value}
                                                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    {option.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rating Filter */}
                                    <div>
                                        <h3 className="font-medium mb-3">التقييم</h3>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'الكل', value: '' },
                                                { label: '4 نجوم فأكثر', value: '4' },
                                                { label: '3 نجوم فأكثر', value: '3' },
                                                { label: '2 نجوم فأكثر', value: '2' }
                                            ].map((option) => (
                                                <label key={option.value} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="rating"
                                                        value={option.value}
                                                        checked={filters.rating === option.value}
                                                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                                                        className="mr-2"
                                                    />
                                                    {option.label}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sort */}
                                    <div>
                                        <h3 className="font-medium mb-3">ترتيب حسب</h3>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="newest">الأحدث</option>
                                            <option value="price-low">السعر: من الأقل للأعلى</option>
                                            <option value="price-high">السعر: من الأعلى للأقل</option>
                                            <option value="rating">التقييم</option>
                                            <option value="name">الاسم</option>
                                        </select>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="w-full"
                                    >
                                        مسح الفلاتر
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Products Grid/List */}
                    <div className="flex-1">
                        {/* Results Info */}
                        <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-sm">
                            <div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {filteredProducts.length} منتج متاح
                                </p>
                                {searchQuery && (
                                    <p className="text-sm text-gray-600">
                                        نتائج البحث عن: <span className="font-medium text-yellow-600">"{searchQuery}"</span>
                                    </p>
                                )}
                                {filters.category && (
                                    <p className="text-sm text-gray-600">
                                        في فئة: <span className="font-medium text-yellow-600">{PRODUCT_CATEGORIES[filters.category.toUpperCase()]}</span>
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">عرض النتائج</p>
                                <p className="text-lg font-bold text-yellow-600">{viewMode === 'grid' ? '🔲' : '📋'}</p>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        {isLoading ? (
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1'
                                }`}>
                                {[...Array(8)].map((_, index) => (
                                    <div key={index} className="animate-pulse bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
                                        <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-48"></div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-2"></div>
                                            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-3 w-3/4"></div>
                                            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-3 w-1/2"></div>
                                            <div className="mt-auto pt-3 border-t border-gray-200">
                                                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-3 w-24"></div>
                                                <div className="flex gap-2">
                                                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1"></div>
                                                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                                <div className="text-8xl mb-6">💎</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    لم يتم العثور على منتجات
                                </h3>
                                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                                    جرب تغيير معايير البحث أو الفلاتر للعثور على المنتجات المناسبة
                                </p>
                                <Button
                                    onClick={clearFilters}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3"
                                >
                                    مسح جميع الفلاتر
                                </Button>
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1 max-w-4xl mx-auto'
                                }`}>
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id || product._id}
                                        product={product}
                                        isListView={viewMode === 'list'}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Load More */}
                        {filteredProducts.length > 0 && filteredProducts.length >= 12 && (
                            <div className="text-center mt-16">
                                <div className="bg-white rounded-2xl p-8 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        هل تريد رؤية المزيد من المنتجات؟
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        اكتشف المزيد من المجوهرات والذهب الرائع
                                    </p>
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        ✨ تحميل المزيد من المنتجات
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        {filteredProducts.length > 0 && (
                            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 text-center">
                                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                                        {filteredProducts.length}
                                    </div>
                                    <div className="text-gray-700 font-medium">منتج متاح</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                        {new Set(filteredProducts.map(p => p.shopId || p.shop?.id)).size}
                                    </div>
                                    <div className="text-gray-700 font-medium">متجر مختلف</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-2">
                                        {new Set(filteredProducts.map(p => p.category)).size}
                                    </div>
                                    <div className="text-gray-700 font-medium">فئة مختلفة</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
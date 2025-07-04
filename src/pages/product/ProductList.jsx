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
            setProducts(response.data || response);
        } catch (error) {
            console.error('Error loading products:', error);
            // Use mock data for demo
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

    const ProductCard = ({ product, isListView = false }) => (
        <Card className={`group hover:shadow-lg transition-all duration-300 ${isListView ? 'flex' : ''}`}>
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
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToFavorites(product.id);
                    }}
                >
                    <Heart className={`w-4 h-4 ${product.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                {product.category && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                        {PRODUCT_CATEGORIES[product.category.toUpperCase()] || product.category}
                    </Badge>
                )}
            </div>

            <div className={`p-4 flex-1 ${isListView ? 'flex flex-col justify-between' : ''}`}>
                <div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-yellow-600 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">{product.rating}</span>
                            <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                        في {product.shopName}
                    </p>
                </div>

                <div className={`flex items-center justify-between ${isListView ? 'mt-4' : ''}`}>
                    <div className="text-xl font-bold text-yellow-600">
                        {product.price.toLocaleString()} ج.م
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(ROUTES.PRODUCT_DETAILS(product.id));
                            }}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            عرض
                        </Button>
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(ROUTES.SHOP_DETAILS(product.shopId));
                            }}
                        >
                            <ShoppingBag className="w-4 h-4 mr-1" />
                            المتجر
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">المنتجات</h1>

                    {/* Search and Controls */}
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <form onSubmit={handleSearch} className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="ابحث عن المنتجات..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </form>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                فلاتر
                            </Button>

                            <div className="flex border rounded-lg">
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
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-600">
                                {filteredProducts.length} منتج
                                {searchQuery && ` لـ "${searchQuery}"`}
                                {filters.category && ` في فئة ${PRODUCT_CATEGORIES[filters.category.toUpperCase()]}`}
                            </p>
                        </div>

                        {/* Products Grid/List */}
                        {isLoading ? (
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                                : 'grid-cols-1'
                                }`}>
                                {[...Array(6)].map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                                        <div className="bg-white p-4 rounded-b-lg">
                                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                                            <div className="h-8 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لم يتم العثور على منتجات
                                </h3>
                                <p className="text-gray-600">
                                    جرب تغيير معايير البحث أو الفلاتر
                                </p>
                            </div>
                        ) : (
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                                : 'grid-cols-1'
                                }`}>
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isListView={viewMode === 'list'}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Load More */}
                        {filteredProducts.length > 0 && (
                            <div className="text-center mt-12">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="px-8"
                                >
                                    تحميل المزيد
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
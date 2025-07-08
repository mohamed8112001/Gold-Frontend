import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
    Search,
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
        rating: '',
        sortBy: 'recommended'
    });
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [userBehavior, setUserBehavior] = useState({
        hasSearched: false,
        hasFiltered: false,
        viewedProducts: [],
        favoriteCategories: [],
        lastActivity: null
    });
    const [displayMode, setDisplayMode] = useState('initial'); // initial, searching, filtered, browsing

    useEffect(() => {
        loadProducts();
    }, [searchQuery, filters]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        loadRelatedProducts();
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        applyFilters();
    }, [products, searchQuery, filters]); // eslint-disable-line react-hooks/exhaustive-deps

    // Track user behavior
    useEffect(() => {
        const hasSearched = searchQuery.length > 0;
        const hasFiltered = filters.category || filters.rating || filters.sortBy !== 'recommended';

        setUserBehavior(prev => ({
            ...prev,
            hasSearched,
            hasFiltered,
            lastActivity: new Date()
        }));

        // Update display mode based on user behavior
        if (hasSearched) {
            setDisplayMode('searching');
        } else if (hasFiltered) {
            setDisplayMode('filtered');
        } else if (filteredProducts.length > 0) {
            setDisplayMode('browsing');
        } else {
            setDisplayMode('initial');
        }
    }, [searchQuery, filters, filteredProducts.length]);

    const trackProductView = (productId) => {
        setUserBehavior(prev => {
            const newBehavior = {
                ...prev,
                viewedProducts: [...new Set([...prev.viewedProducts, productId])],
                lastActivity: new Date()
            };

            // Save to localStorage
            localStorage.setItem('userBehavior', JSON.stringify(newBehavior));
            return newBehavior;
        });
    };

    // Load user behavior from localStorage on mount
    useEffect(() => {
        const savedBehavior = localStorage.getItem('userBehavior');
        if (savedBehavior) {
            try {
                const parsed = JSON.parse(savedBehavior);
                setUserBehavior(prev => ({
                    ...prev,
                    ...parsed,
                    lastActivity: parsed.lastActivity ? new Date(parsed.lastActivity) : null
                }));
            } catch (error) {
                console.error('Failed to parse saved user behavior:', error);
            }
        }
    }, []);

    const getDisplayMessage = () => {
        switch (displayMode) {
            case 'searching':
                return {
                    title: `Search Results for "${searchQuery}"`,
                    subtitle: `Found ${filteredProducts.length} products matching your search`,
                    icon: '🔍'
                };
            case 'filtered':
                return {
                    title: 'Filtered Products',
                    subtitle: `Showing ${filteredProducts.length} products based on your preferences`,
                    icon: ' '
                };
            case 'browsing':
                return {
                    title: 'Browse Products',
                    subtitle: `Discover ${filteredProducts.length} amazing products`,
                    icon: ''
                };
            default:
                return {
                    title: 'Product Gallery',
                    subtitle: 'Discover the finest jewelry and gold pieces from the best stores',
                    icon: ''
                };
        }
    };

    const getSuggestionMessage = () => {
        if (displayMode === 'searching' && filteredProducts.length === 0) {
            return {
                title: "No products found",
                message: "Try adjusting your search terms or browse our categories",
                action: "Clear Search",
                actionFn: () => {
                    setSearchQuery('');
                    setSearchParams({});
                }
            };
        }

        if (displayMode === 'filtered' && filteredProducts.length === 0) {
            return {
                title: "No products match your filters",
                message: "Try removing some filters to see more products",
                action: "Clear Filters",
                actionFn: clearFilters
            };
        }

        if (userBehavior.viewedProducts.length > 3) {
            return {
                title: "Based on your browsing",
                message: "You seem interested in jewelry! Check out our featured collections",
                action: "View Collections",
                actionFn: () => navigate('/collections')
            };
        }

        return null;
    };

    const loadProducts = async () => {
        try {
            setIsLoading(true);

            // Build query parameters for backend filtering
            const queryParams = new URLSearchParams();

            if (searchQuery) queryParams.append('search', searchQuery);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

            const url = `https://gold-backend-production.up.railway.app/product${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': user?.token ? `Bearer ${user.token}` : '',
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            const data = result.data || result;

            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRelatedProducts = async () => {
        if (!user?.token) return;

        try {
            const response = await fetch('https://gold-backend-production.up.railway.app/product/related?limit=6', {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.status === 'success') {
                setRelatedProducts(data.data);
            }
        } catch (error) {
            console.error('Error loading related products:', error);
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
            filtered = filtered.filter(product =>
                product.design_type === filters.category ||
                product.category === filters.category
            );
        }



        // Rating filter
        if (filters.rating) {
            const minRating = parseFloat(filters.rating);
            filtered = filtered.filter(product => (product.rating || 0) >= minRating);
        }

        // Sort
        switch (filters.sortBy) {
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
            rating: '',
            sortBy: 'recommended'
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



    const ProductCard = ({ product, isListView = false }) => {
        const productId = product.id || product._id;

        // Safe data extraction
        const safeProduct = {
            name: product.name || product.title || 'Untitled Product',
            description: product.description || 'No description available',
            image: product.image || product.imageUrl || product.images?.[0] || product.images_urls?.[0] || '/api/placeholder/300/300',
            rating: typeof product.rating === 'number' ? product.rating : 4.5,
            reviewCount: product.reviewCount || product.reviews?.length || 0,
            shopName: product.shopName || product.shop?.name || 'Unknown Shop',
            shopId: product.shopId || product.shop?.id || product.shop?._id,
            isFavorited: product.isFavorited || false,
            category: product.category || product.design_type || 'other',
            design_type: product.design_type || product.category || 'other'
        };

        return (
            <Card
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-2xl transform hover:-translate-y-1 ${isListView ? 'flex h-48' : 'flex flex-col h-full'}`}
                onClick={async () => {
                    try {
                        // Track product view locally
                        trackProductView(productId);

                        // Track the click (interest)
                        if (user) {
                            await fetch("https://gold-backend-production.up.railway.app/product/track", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${user.token}`, // لو عندك user.token
                                },
                                body: JSON.stringify({ productId }),
                            });
                        }
                    } catch (error) {
                        console.error("Failed to track product click:", error);
                    } finally {
                        // Navigate to product details
                        navigate(ROUTES.PRODUCT_DETAILS(productId));
                    }
                }}
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

                    {/* Actions - Fixed at bottom */}
                    <div className="mt-auto pt-3 border-t border-gray-100">

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
                        {(() => {
                            const message = getDisplayMessage();
                            return (
                                <>
                                    <div className="text-6xl mb-4">{message.icon}</div>
                                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                                        {message.title}
                                    </h1>
                                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                        {message.subtitle}
                                    </p>
                                </>
                            );
                        })()}
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
                                        placeholder="Search for products, jewelry, gold..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-12 pr-6 py-4 text-lg rounded-full border-0 focus:ring-0 bg-transparent placeholder-gray-500"
                                    />
                                    <Button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-2 rounded-full"
                                    >
                                        Search
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                                <span className="text-sm font-medium text-gray-600">
                                    {filteredProducts.length} products
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
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
                                        <h3 className="font-medium mb-3">Category</h3>
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
                                                All
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



                                    {/* Rating Filter */}
                                    <div>
                                        <h3 className="font-medium mb-3">Rating</h3>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'All', value: '' },
                                                { label: '4+ Stars', value: '4' },
                                                { label: '3+ Stars', value: '3' },
                                                { label: '2+ Stars', value: '2' }
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
                                        <h3 className="font-medium mb-3">Sort By</h3>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        >
                                            <option value="recommended">Recommended for You</option>
                                            <option value="newest">Newest</option>
                                            <option value="name">Name</option>
                                        </select>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="w-full"
                                    >
                                        Clear All Filters
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
                                    {filteredProducts.length} products available
                                </p>
                                {searchQuery && (
                                    <p className="text-sm text-gray-600">
                                        Search results for: <span className="font-medium text-yellow-600">"{searchQuery}"</span>
                                    </p>
                                )}
                                {filters.category && (
                                    <p className="text-sm text-gray-600">
                                        Category: <span className="font-medium text-yellow-600">{PRODUCT_CATEGORIES[filters.category.toUpperCase()]}</span>
                                    </p>
                                )}
                                {userBehavior.viewedProducts.length > 0 && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        You've viewed {userBehavior.viewedProducts.length} products
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Display mode</p>
                                <p className="text-lg font-bold text-yellow-600">{viewMode === 'grid' ? '🔲' : '📋'}</p>
                                {userBehavior.hasSearched && (
                                    <div className="mt-2">
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                            Searching
                                        </span>
                                    </div>
                                )}
                                {userBehavior.hasFiltered && (
                                    <div className="mt-2">
                                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                            Filtered
                                        </span>
                                    </div>
                                )}
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
                                {(() => {
                                    const suggestion = getSuggestionMessage();
                                    return (
                                        <>
                                            <div className="text-8xl mb-6">
                                                {displayMode === 'searching' ? '🔍' : displayMode === 'filtered' ? '🎯' : '💎'}
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                                {suggestion?.title || "No products found"}
                                            </h3>
                                            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                                                {suggestion?.message || "Try adjusting your search or filters"}
                                            </p>
                                            <Button
                                                onClick={suggestion?.actionFn || clearFilters}
                                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3"
                                            >
                                                {suggestion?.action || "Clear All Filters"}
                                            </Button>
                                        </>
                                    );
                                })()}
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

                        {/* Related Products Section */}
                        {relatedProducts.length > 0 && userBehavior.viewedProducts.length > 0 && (
                            <div className="mt-16">
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 shadow-lg mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                     Recommended Based on Your Views
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Products similar to what you've been browsing
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {relatedProducts.slice(0, 6).map((product) => {
                                            const safeProduct = {
                                                id: product._id || product.id,
                                                name: product.title || product.name || 'Untitled Product',
                                                description: product.description || 'No description available',
                                                image: product.images_urls?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center&auto=format&q=60',
                                                shopName: product.shop?.name || 'Unknown Shop',
                                                shopId: product.shop?._id || product.shop?.id,
                                                rating: product.rating || 4.5,
                                                reviewCount: product.reviewCount || 0,
                                                isFavorited: product.isFavorited || false
                                            };

                                            return (
                                                <Card
                                                    key={safeProduct.id}
                                                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white rounded-2xl shadow-md h-full flex flex-col"
                                                    onClick={async () => {
                                                        try {
                                                            trackProductView(safeProduct.id);

                                                            if (user) {
                                                                await fetch("https://gold-backend-production.up.railway.app/product/track", {
                                                                    method: "POST",
                                                                    headers: {
                                                                        "Content-Type": "application/json",
                                                                        Authorization: `Bearer ${user.token}`,
                                                                    },
                                                                    body: JSON.stringify({ productId: safeProduct.id }),
                                                                });
                                                            }
                                                        } catch (error) {
                                                            console.error("Failed to track product click:", error);
                                                        } finally {
                                                            navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id));
                                                        }
                                                    }}
                                                >
                                                    <div className="relative overflow-hidden rounded-t-2xl">
                                                        <img
                                                            src={safeProduct.image}
                                                            alt={safeProduct.name}
                                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center&auto=format&q=60';
                                                            }}
                                                        />
                                                        <div className="absolute top-3 right-3">
                                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                                                Recommended
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-4 flex-1 flex flex-col">
                                                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                                                            {safeProduct.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                            {safeProduct.description}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <div className="flex items-center">
                                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                                <span className="text-sm text-gray-600 ml-1">
                                                                    {safeProduct.rating.toFixed(1)}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(ROUTES.PRODUCT_DETAILS(safeProduct.id));
                                                                }}
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Smart Suggestions */}
                        {filteredProducts.length > 0 && (
                            <div className="mt-16">
                                {userBehavior.viewedProducts.length > 2 && (
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                                             Personalized for You
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Based on your browsing, you might like these categories
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {Object.entries(PRODUCT_CATEGORIES).slice(0, 4).map(([key, value]) => (
                                                <Button
                                                    key={key}
                                                    variant="outline"
                                                    onClick={() => handleFilterChange('category', key.toLowerCase())}
                                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                >
                                                    {value}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {filteredProducts.length >= 12 && (
                                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                                            Want to see more products?
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Discover more amazing jewelry and gold pieces
                                        </p>
                                        <Button
                                            size="lg"
                                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                        >
                                             Load More Products
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Activity Summary */}
                        {(userBehavior.hasSearched || userBehavior.hasFiltered || userBehavior.viewedProducts.length > 0) && (
                            <div className="mt-8 bg-gray-50 rounded-2xl p-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Activity</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{userBehavior.viewedProducts.length}</div>
                                        <div className="text-sm text-gray-600">Products Viewed</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {userBehavior.hasSearched ? '✓' : '○'}
                                        </div>
                                        <div className="text-sm text-gray-600">Search Used</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {userBehavior.hasFiltered ? '✓' : '○'}
                                        </div>
                                        <div className="text-sm text-gray-600">Filters Applied</div>
                                    </div>
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

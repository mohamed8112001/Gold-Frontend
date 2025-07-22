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
import { useTranslation } from 'react-i18next';
import { productService } from '../../services/productService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, PRODUCT_CATEGORIES } from '../../utils/constants.js';
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const ProductList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();
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

    // Generate personalized message based on user behavior
    const getPersonalizedMessage = () => {
        const viewedCount = userBehavior.viewedProducts.length;
        // const hasSearched = userBehavior.hasSearched;
        // const hasFiltered = userBehavior.hasFiltered;
        // const isFirstTime = viewedCount === 0 && !hasSearched && !hasFiltered;

        return {
            text: `You've viewed ${viewedCount} products`,
            icon: "",
            color: "text-gray-600",
            bgColor: "bg-gray-50"
        };
    };

    // Generate activity summary message
    // const getActivitySummaryMessage = () => {
    //     const viewedCount = userBehavior.viewedProducts.length;

    //     if (viewedCount === 0) {
    //         return "Start your jewelry journey today!";
    //     }

    //     if (viewedCount >= 1 && viewedCount <= 5) {
    //         return "You're just getting started - keep exploring!";
    //     }

    //     if (viewedCount >= 6 && viewedCount <= 15) {
    //         return "Great progress! You're discovering our collection.";
    //     }

    //     if (viewedCount >= 16 && viewedCount <= 30) {
    //         return "Impressive! You're becoming a jewelry connoisseur.";
    //     }

    //     if (viewedCount > 30) {
    //         return "Amazing! You're a true jewelry enthusiast!";
    //     }

    //     return "Your shopping journey continues...";
    // };

    // Generate motivational message based on results and behavior
    const getMotivationalMessage = () => {
        const viewedCount = userBehavior.viewedProducts.length;
        const resultsCount = filteredProducts.length;

        if (searchQuery && resultsCount === 0) {
            return "🔍 No matches found. Try different keywords or browse our categories!";
        }

        if (filters.category && resultsCount === 0) {
            return "🎯 No products in this category yet. Check back soon for new arrivals!";
        }

        if (resultsCount === 0) {
            return "🌟 Start exploring our amazing jewelry collection!";
        }

        if (viewedCount === 0 && resultsCount > 0) {
            return "✨ So many beautiful pieces to discover! Start browsing now.";
        }

        if (viewedCount > 0 && viewedCount < 5) {
            return "👀 You're off to a great start! Keep exploring to find your perfect piece.";
        }

        if (viewedCount >= 5 && viewedCount < 15) {
            return "🎯 You're really getting into it! Found anything you love yet?";
        }

        if (viewedCount >= 15) {
            return "💎 You're a true jewelry enthusiast! Your taste is impeccable.";
        }

        return "🛍️ Happy shopping! Take your time to find the perfect piece.";
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
            console.log(`baseUrl: ${baseUrl}`);
            // Build query parameters for backend filtering
            const queryParams = new URLSearchParams();

            if (searchQuery) queryParams.append('search', searchQuery);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

            const url = `${baseUrl}/product${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
            const response = await fetch(`${baseUrl}/product/related?limit=6`, {
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

        // Enhanced search filter
        if (searchQuery && searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(product => {
                const name = (product.name || '').toLowerCase();
                const description = (product.description || '').toLowerCase();
                const category = (product.category || '').toLowerCase();
                const shopName = (product.shopName || '').toLowerCase();

                return name.includes(searchTerm) ||
                    description.includes(searchTerm) ||
                    category.includes(searchTerm) ||
                    shopName.includes(searchTerm);
            });
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
        console.log('🔍 Search triggered with query:', searchQuery);

        // Update URL parameters
        setSearchParams(prev => {
            if (searchQuery && searchQuery.trim()) {
                prev.set('search', searchQuery.trim());
            } else {
                prev.delete('search');
            }
            return prev;
        });

        // Force re-apply filters immediately
        applyFilters();
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
                className={`group hover:shadow-2xl  transition-all duration-700 cursor-pointer border-0 shadow-xl hover:shadow-3xl transform hover:-translate-y-4 hover:scale-105 ${isListView ? 'flex h-64' : 'flex flex-col h-full'} bg-white rounded-3xl overflow-hidden backdrop-blur-sm`}
                onClick={async () => {
                    try {
                        // Track product view locally
                        trackProductView(productId);

                        // Track the click (interest)
                        if (user) {
                            await fetch(`${baseUrl}/product/track`, {
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
                <div className={`relative overflow-hidden rounded-t-3xl ${isListView ? 'w-64 flex-shrink-0 rounded-l-3xl rounded-tr-none' : 'w-full'}`}>
                    <div className={`relative ${isListView ? 'h-full' : 'h-48'} overflow-hidden`}>
                        <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${safeProduct.image}`}
                            alt={safeProduct.name}
                            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 ease-out"
                            onError={(e) => {
                                console.log('❌ Product image failed to load:', e.target.src);
                                e.target.style.display = 'none';
                                const fallback = e.target.parentElement.querySelector('.fallback-image');
                                if (fallback) {
                                    fallback.style.display = 'flex';
                                }
                            }}
                        />

                        {/* Premium fallback image */}
                        <div className="fallback-image absolute inset-0 bg-gradient-to-br from-[#FFF0CC] via-[#FFF8E6] to-[#FFE6B3] hidden items-center justify-center group-hover:from-[#FFE6B3] group-hover:via-[#FFF0CC] group-hover:to-[#FFDB99] transition-all duration-700">
                            <div className="text-center transform group-hover:scale-110 transition-transform duration-700">
                                <div className="relative mb-4">
                                    <div className="text-6xl mb-2 filter drop-shadow-2xl">💎</div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-xl"></div>
                                </div>
                                <div className="text-sm text-gray-800 font-bold px-3 py-1 bg-white/90 rounded-xl backdrop-blur-md shadow-lg border border-[#C37C00]">
                                    {safeProduct.name}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C37C00]/10 via-transparent to-[#A66A00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {/* Premium favorite button */}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-3 right-3 bg-white/95 hover:bg-white shadow-lg backdrop-blur-md rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-white/70 z-20"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(productId);
                        }}
                    >
                        <Heart className={`w-4 h-4 ${safeProduct.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'} transition-colors duration-200`} />
                    </Button>

                    {/* Premium category badge */}
                    {safeProduct.category && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-[#C37C00] via-[#A66A00] to-[#8A5700] text-white shadow-lg px-3 py-1 text-xs font-bold border border-[#C37C00]/50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-20">
                            {PRODUCT_CATEGORIES[safeProduct.category.toUpperCase()] || safeProduct.category}
                        </Badge>
                    )}


                </div>

                <div className={`p-5 flex flex-col h-full ${isListView ? 'justify-between' : ''} relative z-10`}>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2 leading-tight group-hover:scale-105 transform origin-left duration-300">
                            {safeProduct.name}
                        </h3>

                        {/* Enhanced shop information */}
                        {safeProduct.shopName && safeProduct.shopName !== 'Unknown Shop' && (
                            <div className="flex items-center gap-2 mb-2 bg-blue-50 p-2 rounded-lg border border-blue-200/50">
                                <div className="w-6 h-6 bg-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center">
                                    <ShoppingBag className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-600 font-medium">Available at</p>
                                    <p className="text-sm font-bold text-[#C37C00] hover:text-[#A66A00] cursor-pointer transition-colors duration-200 truncate" onClick={(e) => {
                                        e.stopPropagation();
                                        if (safeProduct.shopId) {
                                            console.log('🏪 Navigating to shop:', safeProduct.shopId);
                                            navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                                        } else {
                                            console.error('🏪 No shop ID available:', safeProduct);
                                        }
                                    }}>
                                        {safeProduct.shopName}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Actions Section */}
                    <div className="mt-auto pt-2">
                        <div className="flex flex-col gap-2">
                            {/* Main View Product Button */}
                            <Button
                                size="md"
                                className="w-full bg-gradient-to-r from-[#C37C00] via-[#A66A00] to-[#8A5700] hover:from-[#A66A00] hover:via-[#8A5700] hover:to-[#6D4500] text-white px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-sm border border-[#C37C00]/50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(ROUTES.PRODUCT_DETAILS(productId));
                                }}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                            </Button>

                            {/* Secondary Actions */}
                            <div className="flex gap-2">
                                {safeProduct.shopId && safeProduct.shopName && safeProduct.shopName !== 'Unknown Shop' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700 hover:text-blue-800 py-2 rounded-lg font-medium transition-all duration-300 text-xs"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('🏪 Shop button clicked, navigating to:', safeProduct.shopId);
                                            navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                                        }}
                                    >
                                        <ShoppingBag className="w-3 h-3 mr-1" />
                                        Shop
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border border-red-300 hover:border-red-500 hover:bg-red-50 text-red-700 hover:text-red-800 py-2 rounded-lg font-medium transition-all duration-300 text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToFavorites(productId);
                                    }}
                                >
                                    <Heart className={`w-3 h-3 mr-1 ${safeProduct.isFavorited ? 'fill-current' : ''}`} />
                                    {safeProduct.isFavorited ? 'Saved' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] pt-20">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
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

                    {/* Enhanced Search and Controls */}
                    <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                        <div className="flex-1 max-w-4xl">
                            <div className="flex gap-4 items-center">
                                {/* Enhanced input container */}
                                <div className="flex-1 relative group">
                                    {/* Enhanced glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-full blur-lg opacity-20 group-hover:opacity-40 group-focus-within:opacity-50 transition-all duration-500"></div>

                                    {/* Main input container */}
                                    <div className="relative bg-white rounded-full border-2 border-gray-300 focus-within:border-[#C37C00] hover:border-[#E6A500] transition-all duration-300 shadow-lg hover:shadow-xl focus-within:shadow-2xl">
                                        {/* Enhanced search icon with loading state */}
                                        <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                                            {isLoading && searchQuery ? (
                                                <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Search className="text-gray-500 w-6 h-6 group-focus-within:text-yellow-600 transition-colors duration-300" />
                                            )}
                                        </div>

                                        {/* Enhanced input field */}
                                        <Input
                                            type="text"
                                            placeholder="Search for products, jewelry, gold items..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSearchQuery(value);
                                                console.log('🔍 Search input changed:', value);

                                                // Update URL immediately for better UX
                                                setSearchParams(prev => {
                                                    if (value && value.trim()) {
                                                        prev.set('search', value.trim());
                                                    } else {
                                                        prev.delete('search');
                                                    }
                                                    return prev;
                                                });
                                            }}
                                            className="pl-14 pr-6 py-5 text-lg rounded-full border-0 focus:ring-0 bg-transparent placeholder-gray-500 focus:placeholder-gray-400 font-medium transition-all duration-300"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSearch(e);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Separate search button */}
                                <Button
                                    type="button"
                                    onClick={handleSearch}
                                    className="bg-gradient-to-r from-[#C37C00] via-[#A66A00] to-[#8A5700] hover:from-[#A66A00] hover:via-[#8A5700] hover:to-[#6D4500] text-white px-8 py-5 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-[#C37C00]/50"
                                >
                                    <Search className="w-5 h-5 mr-2" />
                                    <span className="text-base">Search</span>
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                                <span className="text-sm font-medium text-gray-600">
                                    {filteredProducts.length} products
                                </span>
                            </div>

                            {/* Enhanced Clear search button */}
                            {searchQuery && (
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSearchParams(prev => {
                                            prev.delete('search');
                                            return prev;
                                        });
                                    }}
                                    className="flex items-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500 hover:text-red-700 px-4 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Clear Search</span>
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-800 px-4 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>Filters</span>
                                {Object.keys(filters).some(key => filters[key]) && (
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
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
                                    <CardTitle className="text-lg">filters</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"n
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
                        <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
                                {(() => {
                                    const personalizedMsg = getPersonalizedMessage();
                                    return (
                                        <div className={`mt-2 p-2 rounded-lg ${personalizedMsg.bgColor} border border-opacity-20`}>
                                            <p className={`text-xs font-medium ${personalizedMsg.color} flex items-center gap-1`}>
                                                <span className="text-sm">{personalizedMsg.icon}</span>
                                                {personalizedMsg.text}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="text-right">
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 font-medium">{getMotivationalMessage()}</p>
                                </div>
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
                                : 'grid-cols-1 max-w-5xl mx-auto'
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
                                                className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3"
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
                                : 'grid-cols-1 max-w-5xl mx-auto'
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
                                <div className="bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] rounded-2xl p-8 shadow-lg mb-8">
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
                                                                await fetch(`${baseUrl}/product/track`, {
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
                                                            <span className="bg-[#FFF0CC] text-[#C37C00] text-xs px-2 py-1 rounded-full font-medium">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;

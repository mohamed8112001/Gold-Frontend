import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import {
  Search,
  Star,
  MapPin,
  Eye,
  Heart,
  Grid3X3,
  List,
  SlidersHorizontal,
  Clock,
  Phone,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';
import { ROUTES } from '../../utils/constants.js';
import { shopService } from '../../services/shopService.js';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const ShopList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();



  // State management
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    rating: searchParams.get('rating') || '',
    specialties: searchParams.get('specialties') || '',
    sortBy: searchParams.get('sortBy') || 'rating'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  });

  // Load shops on mount and when filters change
  useEffect(() => {
    loadShops();
  }, [filters, searchQuery, pagination.page]);

  // Apply filters and update URL params
  useEffect(() => {
    updateURLParams();
  }, [filters, searchQuery]);

  // Load shops from API
  const loadShops = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🏪 Loading shops with filters:', { searchQuery, filters });

      // Build query parameters
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };

      // Add search query if present
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      console.log('🏪 API params:', params);

      const response = await shopService.getAllShops(params);

      if (response.success) {
        const shopsData = response.data || [];
        console.log('✅ Shops loaded:', shopsData.length);

        setShops(prevShops =>
          pagination.page === 1
            ? shopsData
            : [...prevShops, ...shopsData]
        );

        setPagination(prev => ({
          ...prev,
          total: response.meta?.total || 0
        }));
      } else {
        console.error('❌ Failed to load shops:', response.message);
        setError(response.message || 'Failed to load shops');
        setShops([]);
      }
    } catch (error) {
      console.error('❌ Error loading shops:', error);
      setError(error.message || 'Network error occurred');
      setShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized filtered shops
  const filteredShops = useMemo(() => {
    let filtered = [...shops];

    // Client-side search (as backup to server-side)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(shop => {
        const name = (shop.name || '').toLowerCase();
        const description = (shop.description || '').toLowerCase();
        const address = (typeof shop.address === 'string' ? shop.address :
          typeof shop.location === 'string' ? shop.location :
            shop.address?.address || shop.location?.address || shop.area || shop.city || '').toLowerCase();
        const ownerName = (shop.ownerName || '').toLowerCase();
        const specialties = Array.isArray(shop.specialties) ? shop.specialties : [];

        return (
          name.includes(query) ||
          description.includes(query) ||
          address.includes(query) ||
          ownerName.includes(query) ||
          specialties.some(specialty => specialty.toLowerCase().includes(query))
        );
      });
    }

    // Client-side location filter (as backup)
    if (filters.location) {
      filtered = filtered.filter(shop => {
        const address = typeof shop.address === 'string' ? shop.address :
          typeof shop.location === 'string' ? shop.location :
            shop.address?.address || shop.location?.address || shop.area || shop.city || '';
        return address.toLowerCase().includes(filters.location.toLowerCase());
      });
    }

    // Client-side rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(shop => {
        const rating = parseFloat(shop.rating || shop.averageRating) || 0;
        return rating >= minRating;
      });
    }

    // Client-side specialties filter
    if (filters.specialties) {
      filtered = filtered.filter(shop => {
        const specialties = Array.isArray(shop.specialties) ? shop.specialties : [];
        const query = filters.specialties.toLowerCase();
        return specialties.some(specialty =>
          specialty.toLowerCase().includes(query)
        );
      });
    }

    // Client-side sorting
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => (parseFloat(b.rating || b.averageRating) || 0) - (parseFloat(a.rating || a.averageRating) || 0));
        break;
      case 'reviews':
        filtered.sort((a, b) => (b.reviewCount || b.reviews?.length || 0) - (a.reviewCount || a.reviews?.length || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        // Default to rating
        filtered.sort((a, b) => (parseFloat(b.rating || b.averageRating) || 0) - (parseFloat(a.rating || a.averageRating) || 0));
    }

    return filtered;
  }, [shops, searchQuery, filters]);

  // Update URL parameters
  const updateURLParams = useCallback(() => {
    const newParams = new URLSearchParams();

    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        newParams.set(key, value);
      }
    });

    setSearchParams(newParams);
  }, [searchQuery, filters, setSearchParams]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    console.log(`🔧 Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    setSearchQuery('');
    setFilters({
      location: '',
      rating: '',
      specialties: '',
      sortBy: 'rating'
    });
    setSearchParams({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Load more shops
  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      page: prev.page + 1
    }));
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    Object.values(filters).forEach(value => {
      if (value && value !== '') count++;
    });
    return count;
  };

  // Enhanced Shop Card Component
  const ShopCard = ({ shop, isListView = false }) => {
    const shopName = shop.name || shop.shopName || 'Unknown Shop';
    const shopAddress = typeof shop.address === 'string'
      ? shop.address
      : typeof shop.location === 'string'
        ? shop.location
        : shop.address?.address || shop.location?.address || shop.area || shop.city || 'Location not specified';
    const shopPhone = shop.phone || shop.whatsapp || 'Not specified';
    const shopDescription = shop.description || 'No description available';
    const shopRating = shop.rating || shop.averageRating || 0;
    const shopSpecialties = shop.specialties || [];
    const shopWorkingHours = shop.workingHours || '9:00 AM - 9:00 PM';
    const shopReviewCount = shop.reviewCount || shop.reviews?.length || 0;

    return (
      <Card
        className={`group relative overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 cursor-pointer border-2 border-[#E2D2B6]/40 hover:border-[#C37C00]/60 bg-gradient-to-br from-white via-[#FFF8E6]/20 to-[#F0E8DB]/30 rounded-3xl shadow-xl hover:shadow-[#C37C00]/25 h-full flex flex-col transform hover:scale-[1.02] ${isListView ? 'lg:flex-row lg:h-auto' : ''}`}
        onClick={() => {
          const shopId = shop._id || shop.id;
          console.log('Navigating to shop:', shopId, shop.name);
          if (shopId) {
            navigate(ROUTES.SHOP_DETAILS(shopId));
          } else {
            console.error('Shop ID is missing:', shop);
          }
        }}
      >
        {/* Enhanced Image Section */}
        <div className={`relative overflow-hidden rounded-t-3xl ${isListView ? 'lg:w-64 lg:flex-shrink-0 lg:rounded-l-3xl lg:rounded-tr-none' : 'w-full'}`}>
          {shop.logoUrl ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/shop-image/${shop.logoUrl}`}
              alt={shopName}
              className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${isListView ? 'h-full lg:h-56' : 'h-56'}`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}

          {/* Enhanced Default Image */}
          <div className={`bg-gradient-to-br from-[#FFF0CC] via-[#FFE6B3] to-[#FFDB99] flex items-center justify-center group-hover:from-[#FFE6B3] group-hover:to-[#FFD700]/30 transition-all duration-700 ${isListView ? 'h-full lg:h-56' : 'h-56'} ${shop.logoUrl ? 'hidden' : 'flex'} relative`}>
            <div className="text-7xl opacity-80 transform group-hover:scale-110 transition-transform duration-500">💎</div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#C37C00]/10 to-transparent"></div>
          </div>

          {/* Enhanced Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Enhanced Favorite Button */}
          <div className="absolute top-3 right-3 z-10">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-[#C37C00] hover:text-white border-0 shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced Rating Badge */}
          {shopRating > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-sm font-bold">
                  {shopRating.toFixed(1)}
                </span>
                {shopReviewCount > 0 && (
                  <span className="text-xs opacity-90">
                    ({shopReviewCount})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* New Badge for Featured Shops */}
          <div className="absolute bottom-3 left-3 z-10">
            <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <span className="text-xs font-semibold text-[#C37C00]">Verified Shop</span>
            </div>
          </div>
        </div>

        {/* Enhanced Content Section */}
        <CardContent className={`p-6 flex-1 flex flex-col bg-gradient-to-b from-white to-[#FFF8E6]/30 ${isListView ? 'lg:flex-1' : ''}`}>
          <div className="flex-1 space-y-4">
            {/* Enhanced Shop Name */}
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-xl mb-1 group-hover:text-[#C37C00] transition-colors duration-300 line-clamp-2 flex-1">
                {shopName}
              </h3>
              {shopRating > 0 && (
                <div className="flex items-center gap-1 ml-2">
                  <div className="flex text-[#C37C00]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(shopRating) ? 'fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Description */}
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors">
              {shopDescription}
            </p>

            {/* Enhanced Info Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center gap-2.5 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFF0CC] to-[#FFE6B3] rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#C37C00]" />
                </div>
                <span className="truncate font-medium">{shopAddress}</span>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFF0CC] to-[#FFE6B3] rounded-full flex items-center justify-center">
                  <Phone className="w-4 h-4 text-[#C37C00]" />
                </div>
                <span className="font-medium">{shopPhone}</span>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFF0CC] to-[#FFE6B3] rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#C37C00]" />
                </div>
                <span className="font-medium">{shopWorkingHours}</span>
              </div>
            </div>

            {/* Enhanced Specialties */}
            {shopSpecialties.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Specialties</h4>
                <div className="flex flex-wrap gap-1.5">
                  {shopSpecialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-[#FFF0CC] to-[#FFE6B3] text-[#C37C00] text-xs px-3 py-1.5 rounded-full font-semibold border border-[#FFE6B3] shadow-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                  {shopSpecialties.length > 3 && (
                    <span className="bg-gradient-to-r from-[#E2D2B6] to-[#D3BB92] text-[#8A6C37] text-xs px-3 py-1.5 rounded-full font-semibold border border-[#D3BB92] shadow-sm">
                      +{shopSpecialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Action Button */}
          <div className="mt-6 pt-4 border-t border-gradient-to-r from-transparent via-[#E2D2B6]/50 to-transparent">
            <Button
              className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white py-3.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl hover:shadow-[#C37C00]/30 group-hover:shadow-2xl"
              onClick={(e) => {
                e.stopPropagation();
                const shopId = shop._id || shop.id;
                if (shopId) {
                  navigate(ROUTES.SHOP_DETAILS(shopId));
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Eye className="w-5 h-5" />
                <span>Explore Shop</span>
                <div className="w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (isLoading && shops.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB]">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A37F41] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading shops...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && shops.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Shops</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadShops} className="bg-[#A37F41] hover:bg-[#8A6C37]">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB]"
      dir="ltr"
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] overflow-hidden mt-4">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-[#F0E8DB] bg-clip-text text-transparent drop-shadow-2xl m-10">
                Discover Stores
              </span>
            </h1>

            <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/30">
                  <div className="flex flex-col lg:flex-row items-center gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative w-full lg:w-auto">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                      <Input
                        type="text"
                        placeholder="Search for jewelry stores..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-14 pr-4 py-4 text-lg rounded-xl border-0 focus:ring-2 focus:ring-[#C37C00]/30 bg-transparent text-gray-900 placeholder-gray-500 font-medium w-full"
                      />
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      {/* Location Filter */}
                      <div className="relative min-w-[200px]">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Location"
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          className="pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-[#C37C00] bg-white"
                        />
                      </div>

                      {/* Rating Filter */}
                      <Select value={filters.rating || "all"} onValueChange={(value) => handleFilterChange('rating', value === "all" ? "" : value)}>
                        <SelectTrigger className="min-w-[150px] py-3 rounded-xl border border-gray-200 focus:border-[#C37C00] bg-white text-sm">
                          <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                          <SelectItem value="4.0">4.0+ Stars</SelectItem>
                          <SelectItem value="3.5">3.5+ Stars</SelectItem>
                          <SelectItem value="3.0">3.0+ Stars</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Specialties Filter */}
                      <Select value={filters.specialty || "all"} onValueChange={(value) => handleFilterChange('specialty', value === "all" ? "" : value)}>
                        <SelectTrigger className="min-w-[150px] py-3 rounded-xl border border-gray-200 focus:border-[#C37C00] bg-white text-sm">
                          <SelectValue placeholder="Specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Specialties</SelectItem>
                          <SelectItem value="rings">Rings</SelectItem>
                          <SelectItem value="necklaces">Necklaces</SelectItem>
                          <SelectItem value="bracelets">Bracelets</SelectItem>
                          <SelectItem value="earrings">Earrings</SelectItem>
                          <SelectItem value="watches">Watches</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Clear Filters Button */}
                      {getActiveFilterCount() > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearFilters}
                          className="px-4 py-3 text-sm rounded-xl border border-gray-200 hover:border-[#C37C00] hover:text-[#C37C00]"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear
                        </Button>
                      )}

                      {/* Search Button */}
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-6 py-3 text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                      >
                        <Search className="w-4 h-4 mr-1" />
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* <div className="flex flex-wrap justify-center gap-6 mt-12">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <div className="w-3 h-3 bg-[#6D552C] rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Available for All Users</span>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <div className="w-3 h-3 bg-[#8A6C37] rounded-full animate-pulse"></div>
                <span className="text-white font-medium">{pagination.total} Stores Available</span>
              </div>
              {user && (
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                  <div className="w-3 h-3 bg-[#A37F41] rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">
                    Logged in as {user.role === 'admin' ? 'Admin' : user.role === 'shop_owner' ? 'Shop Owner' : 'Customer'}
                  </span>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Shops Grid/List */}
          <div className="w-full">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-6 shadow-lg border-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#A37F41] rounded-full"></div>
                  <span className="text-lg font-semibold text-gray-800">
                    {filteredShops.length} of {pagination.total} Stores
                  </span>
                </div>
                {searchQuery && (
                  <div className="text-sm text-gray-500">
                    for "{searchQuery}"
                  </div>
                )}
                {getActiveFilterCount() > 0 && (
                  <div className="text-sm text-gray-500">
                    {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#F8F4ED] px-4 py-2 rounded-full border border-[#E2D2B6]/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-[#F0E8DB] text-[#8A6C37]' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-[#F0E8DB] text-[#8A6C37]' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Shops Grid/List */}
            {filteredShops.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-white to-[#F8F4ED]/50 rounded-2xl shadow-lg border border-[#E2D2B6]/30">
                <div className="text-8xl mb-6">🏪</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No shops found</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Try adjusting your search terms or filters to find what you're looking for
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3 shadow-lg hover:shadow-[#C37C00]/30"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              /* Premium Shops Section */
              filteredShops.length > 0 && (
                <>
                  {/* Premium Badge */}
                  <div className="mb-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white px-6 py-2 rounded-full shadow-lg">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-bold text-sm">Premium Featured Stores</span>
                        </div>
                      </div>
                    </div>

                    {/* Premium Shops Grid */}
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-16">
                      {filteredShops.slice(0, 4).map((shop, index) => (
                        <div key={shop._id || shop.id} className="relative">
                          {/* Premium Badge */}
                          <div className="absolute -top-3 left-3 z-20">
                            <div className={`bg-gradient-to-r ${index === 0 ? 'from-yellow-400 to-yellow-600' :
                              index === 1 ? 'from-gray-300 to-gray-500' :
                                index === 2 ? 'from-amber-600 to-amber-800' :
                                  'from-blue-400 to-blue-600'} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                              #{index + 1} Premium
                            </div>
                          </div>
                          {/* Premium Crown */}
                          <div className="absolute -top-2 right-3 z-20">
                            <div className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] p-1.5 rounded-full shadow-lg">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                              </svg>
                            </div>
                          </div>
                          {/* Use Regular ShopCard */}
                          <div className="border-4 border-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-3xl p-1 bg-gradient-to-br from-[#C37C00] to-[#A66A00]">
                            <div className="bg-white rounded-2xl overflow-hidden">
                              <ShopCard shop={shop} isListView={false} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Regular Shops Section */}
                  {filteredShops.length > 4 && (
                    <>
                      <div className="flex items-center justify-center mb-6">
                        <div className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full">
                          <span className="font-semibold text-sm">All Stores</span>
                        </div>
                      </div>

                      <div className={`grid ${viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                        : 'grid-cols-1 gap-6'
                        }`}>
                        {filteredShops.slice(4).map((shop) => (
                          <ShopCard key={shop._id || shop.id} shop={shop} isListView={viewMode === 'list'} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )
            )}

            {/* Load More Button */}
            {pagination.total > filteredShops.length && (
              <div className="text-center mt-12">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-[#C37C00]/30 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Load More Shops'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopList;
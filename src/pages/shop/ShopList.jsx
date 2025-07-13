import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
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

// Separate FilterPanel Component
const FilterPanel = ({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters, 
  onFilterChange, 
  onClearFilters 
}) => {
  return (
    <Card className="border-0 shadow-xl rounded-3xl">
      <CardContent className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-2xl text-gray-900">Search Filters</h3>
        </div>

        <div className="space-y-8">
          {/* Search */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-4">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 transition-colors duration-300 text-base font-medium"
              />
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-4">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Choose city or area"
                value={filters.location}
                onChange={(e) => onFilterChange('location', e.target.value)}
                className="pl-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 transition-colors duration-300 text-base font-medium"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-4">
              Minimum Rating
            </label>
            <Select value={filters.rating || "all"} onValueChange={(value) => onFilterChange('rating', value === "all" ? "" : value)}>
              <SelectTrigger className="w-full py-4 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 transition-colors duration-300 bg-white text-base font-medium">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
                <SelectItem value="3.0">3.0+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specialties Filter */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-4">
              Specialty
            </label>
            <Input
              placeholder="e.g: Rings, Necklaces, Bracelets"
              value={filters.specialties}
              onChange={(e) => onFilterChange('specialties', e.target.value)}
              className="py-4 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 transition-colors duration-300 text-base font-medium"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-4">
              Sort By
            </label>
            <Select value={filters.sortBy || "rating"} onValueChange={(value) => onFilterChange('sortBy', value)}>
              <SelectTrigger className="w-full py-4 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 transition-colors duration-300 bg-white text-base font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full py-4 rounded-2xl border-2 border-red-200 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 font-bold text-base"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ShopList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Safe AuthContext usage with fallback
  let user = null;
  try {
    const authContext = useContext(AuthContext);
    user = authContext?.user || null;
  } catch (error) {
    console.log('AuthContext not available, continuing without user data');
  }

  // State management
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
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
        const address = (shop.address || shop.area || shop.city || '').toLowerCase();
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
        const address = shop.address || shop.area || shop.city || '';
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

  // Shop Card Component
  const ShopCard = ({ shop, isListView = false }) => {
    const shopName = shop.name || 'متجر غير محدد';
    const shopAddress = shop.address || shop.area || shop.city || 'العنوان غير محدد';
    const shopPhone = shop.phone || shop.whatsapp || 'غير محدد';
    const shopDescription = shop.description || 'لا يوجد وصف';
    const shopRating = shop.rating || shop.averageRating || 0;
    const shopSpecialties = shop.specialties || [];
    const shopWorkingHours = shop.workingHours || '9:00 ص - 9:00 م';
    const shopImage = shop.image || shop.logoUrl || null;
    const shopReviewCount = shop.reviewCount || shop.reviews?.length || 0;

    return (
      <Card
        className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer border-0 bg-white rounded-3xl shadow-lg h-full flex flex-col ${isListView ? 'lg:flex-row lg:h-auto' : ''}`}
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
        <div className={`relative overflow-hidden ${isListView ? 'lg:w-64 lg:flex-shrink-0' : 'w-full'}`}>
          {shop.logoUrl ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/shop-image/${shop.logoUrl}`}
              alt={shopName}
              className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${isListView ? 'h-full lg:h-48' : 'h-52'}`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center group-hover:from-yellow-200 group-hover:to-yellow-300 transition-colors duration-300 ${isListView ? 'h-full lg:h-48' : 'h-52'} ${shop.logoUrl ? 'hidden' : 'flex'}`}>
            <div className="text-5xl">💍</div>
          </div>
          
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {shopRating > 0 && (
            <div className="absolute top-2 left-2">
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-800">
                  {shopRating.toFixed(1)}
                </span>
                {shopReviewCount > 0 && (
                  <span className="text-xs text-gray-500">
                    ({shopReviewCount})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <CardContent className={`p-6 flex-1 flex flex-col ${isListView ? 'lg:flex-1' : ''}`}>
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
              {shopName}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {shopDescription}
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">{shopAddress}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{shopPhone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{shopWorkingHours}</span>
              </div>
            </div>

            {shopSpecialties.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {shopSpecialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                  {shopSpecialties.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{shopSpecialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <Button
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                const shopId = shop._id || shop.id;
                if (shopId) {
                  navigate(ROUTES.SHOP_DETAILS(shopId));
                }
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Shop
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (isLoading && shops.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
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
              <Button onClick={loadShops} className="bg-yellow-600 hover:bg-yellow-700">
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
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50"
      dir="ltr"
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 overflow-hidden mt-4">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent drop-shadow-2xl m-10">
                Discover Stores
              </span>
            </h1>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/30">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                      <Input
                        type="text"
                        placeholder="Search for jewelry stores..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-14 pr-4 py-4 text-lg rounded-xl border-0 focus:ring-2 focus:ring-yellow-300 bg-transparent text-gray-900 placeholder-gray-500 font-medium"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-6 mt-12">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Available for All Users</span>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">{pagination.total} Stores Available</span>
              </div>
              {user && (
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">
                    Logged in as {user.role === 'admin' ? 'Admin' : user.role === 'shop_owner' ? 'Shop Owner' : 'Customer'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
          {/* Filters Sidebar */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center py-3 rounded-xl border-2 border-gray-300 hover:border-yellow-400 transition-colors duration-300"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
            <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
              <FilterPanel 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                filters={filters} 
                setFilters={setFilters} 
                onFilterChange={handleFilterChange} 
                onClearFilters={clearFilters} 
              />
            </div>
          </div>

          {/* Shops Grid/List */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-6 shadow-lg border-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
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
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Shops Grid/List */}
            {filteredShops.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <div className="text-8xl mb-6">🏪</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No shops found</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Try adjusting your search terms or filters to find what you're looking for
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
                }`}>
                {filteredShops.map((shop) => (
                  <ShopCard key={shop._id || shop.id} shop={shop} isListView={viewMode === 'list'} />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {pagination.total > filteredShops.length && (
              <div className="text-center mt-12">
                <Button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-xl font-semibold"
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
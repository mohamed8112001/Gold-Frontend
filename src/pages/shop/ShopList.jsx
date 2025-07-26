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
    specialties: searchParams.get('specialties') || '', // توحيد الاسم
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

      // Build query parameters بدون إرسال الفلاتر الفارغة
      const params = {};
      if (filters.location) params.location = filters.location;
      if (filters.rating) params.rating = filters.rating;
      if (filters.specialties) params.specialties = filters.specialties;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      params.page = pagination.page;
      params.limit = pagination.limit;
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await shopService.getAllShops(params);

      if (response.success) {
        const shopsData = response.data || [];
        console.log(' Shops loaded:', shopsData.length);

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
        console.error('Failed to load shops:', response.message);
        setError(response.message || 'Failed to load shops');
        setShops([]);
      }
    } catch (error) {
      console.error('Error loading shops:', error);
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
    console.log(` Filter changed: ${key} = ${value}`);
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    console.log('Clearing all filters');
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
    const shopDescription = shop.description || 'No description available';
    const shopRating = shop.rating || shop.averageRating || 0;
    const shopSpecialties = shop.specialties || [];
    const shopWorkingHours = shop.workingHours || '9:00 AM - 9:00 PM';
    const shopReviewCount = shop.reviewCount || shop.reviews?.length || 0;

    return (
      <Card
        className={`group relative overflow-hidden hover:shadow-lg hover:-translate-y-3 transition-all duration-700 cursor-pointer border-2 border-secondary-2/40 hover:border-primary-500/60 bg-gradient-to-br from-white via-primary-1/20 to-primary-2/30 rounded-3xl hover:shadow-primary-500/25 h-full flex flex-col transform hover:scale-[1.02] font-cairo ${isListView ? 'lg:flex-row lg:h-auto' : ''}`}
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
                      className="bg-gradient-to-r from-[#FFF0CC] to-[#FFE6B3] text-[#C37C00] text-xs px-3 py-1.5 rounded-full font-semibold border border-[#FFE6B3] "
                    >
                      {specialty}
                    </span>
                  ))}
                  {shopSpecialties.length > 3 && (
                    <span className="bg-gradient-to-r from-[#E2D2B6] to-[#D3BB92] text-[#8A6C37] text-xs px-3 py-1.5 rounded-full font-semibold border border-[#D3BB92] ">
                      +{shopSpecialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Action Button */}
          <div className="mt-6 pt-4 border-t border-gradient-to-r from-transparent via-secondary-2/50 to-transparent">
            <Button
              className="w-full bg-gradient-to-r from-primary-500 via-primary-500 to-primary-600 hover:from-primary-600 hover:via-primary-600 hover:to-primary-600 text-white py-3.5 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/30"
              onClick={(e) => {
                e.stopPropagation();
                const shopId = shop._id || shop.id;
                if (shopId) {
                  navigate(ROUTES.SHOP_DETAILS(shopId));
                }
              }}
            >
              <div className="flex items-center justify-center gap-2 ">
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
              <p className="text-gray-600">جاري تحميل المتاجر...</p>
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
              <div className="text-6xl mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في تحميل المتاجر</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadShops} className="bg-[#A37F41] hover:bg-[#8A6C37]">
                حاول مرة أخرى
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
      <div className="relative bg-white text-[#C37C00] overflow-hidden mt-4 ">
        {/* تأثير خلفية ذهبي هادي */}
        <div className="absolute inset-0 bg-[#C37C00]/5 pointer-events-none"></div>

        {/* دوائر زخرفية بلون ذهبي خفيف */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#C37C00]/10 rounded-full blur-2xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-[#C37C00]/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-[#C37C00]/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight text-[#C37C00]">
              <span className="bg-gradient-to-r from-[#C37C00] to-[#E6A500] bg-clip-text text-transparent drop- m-10">
                اكتشف المتاجر
              </span>
            </h1>

            <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm"></div>
                <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-4  border border-white/30">
                  <div className="flex flex-col lg:flex-row items-center gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative w-full lg:w-auto">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C37C00] w-6 h-6" />
                      <Input
                        type="text"
                        placeholder="ابحث عن متاجر المجوهرات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-14 pr-4 py-4 text-lg rounded-xl border-0 focus:ring-2 focus:ring-[#C37C00]/30 bg-transparent text-[#C37C00] placeholder-[#C37C00]/70 font-medium w-full"
                      />
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      {/* Location Filter */}
                      <div className="relative min-w-[200px]">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C37C00]/70 w-4 h-4" />
                        <Input
                          placeholder="الموقع"
                          value={filters.location}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                          className="pl-10 pr-4 py-3 text-sm rounded-xl border border-[#C37C00]/50 focus:border-[#C37C00] bg-white text-[#C37C00]"
                        />
                      </div>

                      {/* Rating Filter */}
                      <Select
                        value={filters.rating || "all"}
                        onValueChange={(value) => handleFilterChange('rating', value === "all" ? "" : value)}
                      >
                        <SelectTrigger className="min-w-[150px] py-3 rounded-xl border border-[#C37C00]/50 focus:border-[#C37C00] bg-white text-sm text-[#C37C00]">
                          <SelectValue placeholder="التقييم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع التقييمات</SelectItem>
                          <SelectItem value="4.5">4.5+ نجوم</SelectItem>
                          <SelectItem value="4.0">4.0+ نجوم</SelectItem>
                          <SelectItem value="3.5">3.5+ نجوم</SelectItem>
                          <SelectItem value="3.0">3.0+ نجوم</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Specialties Filter */}
                      <Select
                        value={filters.specialties || "all"}
                        onValueChange={(value) => handleFilterChange('specialties', value === "all" ? "" : value)}
                      >
                        <SelectTrigger className="min-w-[150px] py-3 rounded-xl border border-[#C37C00]/50 focus:border-[#C37C00] bg-white text-sm text-[#C37C00]">
                          <SelectValue placeholder="التخصص" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع التخصصات</SelectItem>
                          <SelectItem value="rings">خواتم</SelectItem>
                          <SelectItem value="necklaces">قلائد</SelectItem>
                          <SelectItem value="bracelets">أساور</SelectItem>
                          <SelectItem value="earrings">أقراط</SelectItem>
                          <SelectItem value="watches">ساعات</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Clear Filters Button */}
                      {getActiveFilterCount() > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={clearFilters}
                          className="px-4 py-3 text-sm rounded-xl border border-[#C37C00] hover:border-[#A37C00] hover:text-[#A37C00]"
                        >
                          <X className="w-4 h-4 mr-1 text-[#C37C00]" />
                          مسح
                        </Button>
                      )}

                      {/* Search Button */}
                      <Button
                        type="submit"
                        className="
                    text-white 
                    text-sm 
                    px-6 py-3.5 
                    rounded-xl 
                    font-semibold 
                     
                    transition-all duration-300 
                    transform hover:scale-[1.02] 
                    bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] 
                    hover:from-[#A66A00] hover:via-[#C37C00] hover:to-[#8A5700]
                    hover: hover:[#C37C00]/30
                    
                  "
                      >
                        <Search className="w-4 h-4 mr-1" />
                        بحث
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="w-full ">
        <div className="max-w-[1600px] mx-auto">
          {/* Shops Grid/List */}
          <div className="w-full">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-6  border-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#A37F41] rounded-full"></div>
                  <span className="text-lg font-semibold text-gray-800">
                    {filteredShops.length} من {pagination.total} متجر
                  </span>
                </div>
                {searchQuery && (
                  <div className="text-sm text-gray-500">
                    لـ "{searchQuery}"
                  </div>
                )}
                {getActiveFilterCount() > 0 && (
                  <div className="text-sm text-gray-500">
                    {getActiveFilterCount()} فلتر نشط
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
              <div className="text-center py-20 bg-gradient-to-br from-white to-[#F8F4ED]/50 rounded-2xl  border border-[#E2D2B6]/30">
                <div className="text-8xl mb-6"></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">لم يتم العثور على متاجر</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  جرب تعديل مصطلحات البحث أو الفلاتر للعثور على ما تبحث عنه
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3  hover:[#C37C00]/30"
                >
                  مسح جميع الفلاتر
                </Button>
              </div>
            ) : (
              /* All Shops Section - No Premium Distinction */
              <div className={`grid ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                : 'grid-cols-1 gap-6'
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
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50"
                >
                  {isLoading ? 'جاري التحميل...' : 'تحميل المزيد من المتاجر'}
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
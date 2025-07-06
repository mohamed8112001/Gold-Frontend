import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
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
  Phone
} from 'lucide-react';
import { ROUTES } from '../../utils/constants.js';
import { shopService } from '../../services/shopService.js';

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

  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    location: '',
    rating: '',
    specialty: '',
    sortBy: 'rating'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [shops, searchQuery, filters]);

  const loadShops = async () => {
    try {
      setIsLoading(true);
      console.log('🏪 Loading shops for ShopList page...');
      console.log('🏪 User authentication status:', user ? 'Authenticated' : 'Not authenticated');
      console.log('🏪 User role:', user?.role || 'No role');

      let response;
      let shopsData = [];

      if (user) {
        // User is authenticated - use authenticated endpoint for role-based filtering
        console.log('🏪 Using authenticated endpoint for role-based shop access');
        try {
          response = await shopService.getAllShops();
          shopsData = Array.isArray(response) ? response : response.data || response.shops || [];
          console.log('🏪 Authenticated shops loaded:', shopsData.length);
        } catch (authError) {
          console.warn('🏪 Authenticated endpoint failed, falling back to public:', authError);
          // Fallback to public endpoint
          response = await shopService.getPublicShops();
          shopsData = Array.isArray(response) ? response : response.data || [];
          console.log('🏪 Fallback to public shops:', shopsData.length);
        }
      } else {
        // User is not authenticated - use public endpoint (only approved shops)
        console.log('🏪 Using public endpoint for approved shops only');
        response = await shopService.getPublicShops();
        shopsData = Array.isArray(response) ? response : response.data || [];
        console.log('🏪 Public approved shops loaded:', shopsData.length);
      }

      console.log('🏪 ShopList - Total shops loaded:', shopsData.length);
      console.log('🏪 ShopList - Sample shop data:', shopsData[0]);

      // Remove duplicates based on _id
      const uniqueShops = shopsData.filter((shop, index, self) =>
        index === self.findIndex(s => (s._id || s.id) === (shop._id || shop.id))
      );

      console.log('🏪 ShopList - Unique shops after deduplication:', uniqueShops.length);
      setShops(uniqueShops);
      console.log('✅ Shops loaded successfully for ShopList page');
    } catch (error) {
      console.error('❌ Error loading shops:', error);
      setShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...shops];

    console.log('🔍 Applying filters to', shops.length, 'shops');
    console.log('🔍 Search query:', searchQuery);
    console.log('🔍 Active filters:', filters);

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(shop => {
        const name = shop.name || '';
        const description = shop.description || '';
        const address = shop.address || shop.area || '';
        const specialties = shop.specialties || [];
        const ownerName = shop.ownerName || '';

        const searchMatch = (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(specialties) && specialties.some(specialty =>
            specialty.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        );

        return searchMatch;
      });
      console.log('🔍 After search filter:', filtered.length, 'shops');
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(shop => {
        const address = shop.address || shop.area || '';
        const locationMatch = address.toLowerCase().includes(filters.location.toLowerCase());
        return locationMatch;
      });
      console.log('🔍 After location filter:', filtered.length, 'shops');
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(shop => {
        const rating = shop.rating || 0;
        const ratingMatch = rating >= parseFloat(filters.rating);
        return ratingMatch;
      });
      console.log('🔍 After rating filter:', filtered.length, 'shops');
    }

    // Specialty filter
    if (filters.specialty) {
      filtered = filtered.filter(shop => {
        const specialties = shop.specialties || [];
        return Array.isArray(specialties) && specialties.some(specialty =>
          specialty.toLowerCase().includes(filters.specialty.toLowerCase())
        );
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'name':
        filtered.sort((a, b) => a.nameAr.localeCompare(b.nameAr));
        break;
      default:
        break;
    }

    console.log('🔍 Final filtered shops:', filtered.length);
    setFilteredShops(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
  };


  const ShopCard = ({ shop, isListView = false }) => {
    // Handle missing data gracefully
    const shopName = shop.name || 'متجر غير محدد';
    const shopAddress = shop.address || shop.area || shop.city || 'العنوان غير محدد';
    const shopPhone = shop.phone || shop.whatsapp || 'غير محدد';
    const shopDescription = shop.description || 'لا يوجد وصف';
    const shopRating = shop.rating || shop.averageRating || 0;
    const shopSpecialties = shop.specialties || [];
    const shopWorkingHours = shop.workingHours || '9:00 ص - 9:00 م';
    const shopImage = shop.image || shop.logoUrl || null;

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
        <div className={`relative overflow-hidden ${isListView ? 'lg:w-64 lg:flex-shrink-0' : 'w-full'
          }`}>
          {shopImage ? (
            <img
              src={shopImage}
              alt={shopName}
              className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${isListView ? 'h-full lg:h-48' : 'h-52'}`}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format&q=60';
              }}
            />
          ) : (
            <div className={`bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center group-hover:from-yellow-200 group-hover:to-yellow-300 transition-colors duration-300 ${isListView ? 'h-full lg:h-48' : 'h-52'
              }`}>
              <div className="text-5xl">💍</div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                // Handle favorite functionality here
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className={`p-6 flex-1 flex flex-col ${isListView ? 'lg:justify-center' : ''}`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 leading-tight">{shopName}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="line-clamp-1">{shopAddress}</span>
              </div>
              {isListView && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{shopPhone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{shopWorkingHours}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{shopDescription}</p>
                </div>
              )}
            </div>
            {shopRating > 0 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-yellow-200 px-3 py-2 rounded-full ml-2 shadow-sm">
                <Star className="w-4 h-4 text-yellow-600 fill-current" />
                <span className="text-sm font-bold text-yellow-700">{shopRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {shopSpecialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {shopSpecialties.slice(0, 2).map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium border border-gray-200"
                >
                  {specialty}
                </span>
              ))}
              {shopSpecialties.length > 2 && (
                <span className="text-xs bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full font-medium border border-gray-200">
                  +{shopSpecialties.length - 2}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  const shopId = shop._id || shop.id;
                  console.log('Button click - navigating to shop:', shopId, shop.name);
                  if (shopId) {
                    navigate(ROUTES.SHOP_DETAILS(shopId));
                  } else {
                    console.error('Shop ID is missing:', shop);
                  }
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Shop
              </Button>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{shop.reviewCount || 0}</div>
                <div className="text-xs text-gray-500">reviews</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FilterPanel = () => (
    <div className={`bg-white rounded-3xl shadow-xl border-0 p-8 h-fit sticky top-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      {/* Filter Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
          <SlidersHorizontal className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-bold text-2xl text-gray-900">Search Filters</h3>
      </div>

      <div className="space-y-8">
        {/* Location Filter */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-4">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Choose city"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="pl-12 py-4 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 transition-colors duration-300 text-base font-medium"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-4">
            Minimum Rating
          </label>
          <div className="relative">
            <Star className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="w-full pl-12 py-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-400 transition-colors duration-300 bg-white text-base font-medium"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="3.0">3.0+ Stars</option>
            </select>
          </div>
        </div>

        {/* Specialty Filter */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-4">
            Specialty
          </label>
          <Input
            placeholder="e.g: Rings, Necklaces, Bracelets"
            value={filters.specialty}
            onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
            className="py-4 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 transition-colors duration-300 text-base font-medium"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-4">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="w-full py-4 border-2 border-gray-200 rounded-2xl focus:border-yellow-400 transition-colors duration-300 bg-white text-base font-medium"
          >
            <option value="rating">Rating</option>
            <option value="reviews">Number of Reviews</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* Clear Filters */}
        <Button
          variant="outline"
          onClick={() => {
            setFilters({
              location: '',
              rating: '',
              specialty: '',
              sortBy: 'rating'
            });
            setSearchQuery('');
            setSearchParams({});
          }}
          className="w-full py-4 rounded-2xl border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 font-bold text-base"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50" dir="ltr">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            {/* Main Title */}
            {/* <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg mb-6">
              <span className="text-white font-semibold text-lg">Premium Jewelry Stores</span>
            </div> */}

            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent drop-shadow-2xl m-10">
                Discover Stores
              </span>
            </h1>

            {/* <p className="text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8 drop-shadow-lg">
              Explore a comprehensive collection of the finest jewelry and gold stores in Egypt
            </p> */}

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto ">
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

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Available for All Users</span>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">{filteredShops.length} Stores Available</span>
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

            {/* Personalized welcome message */}
            {/* {user && (
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl">
                  <p className="text-white text-lg font-medium">
                    {user.role === 'admin' && (
                      <>👑 Welcome Admin! You can view and manage all stores in the system</>
                    )}
                    {user.role === 'shop_owner' && (
                      <>🏪 Welcome Shop Owner! Explore other stores and get inspiration</>
                    )}
                    {user.role === 'customer' && (
                      <>💎 Welcome Dear Customer! Discover the most beautiful jewelry stores and choose the best for you</>
                    )}
                    {!user.role && (
                      <>🌟 Welcome! Explore all available jewelry stores</>
                    )}
                  </p>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
          {/* Enhanced Filters Sidebar */}
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
            <FilterPanel />
          </div>

          {/* Enhanced Main Content */}
          <div className="flex-1">
            {/* Enhanced View Controls */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-6 shadow-lg border-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-lg font-semibold text-gray-800">
                    {filteredShops.length} Stores Found
                  </span>
                </div>
                {searchQuery && (
                  <div className="text-sm text-gray-500">
                    for "{searchQuery}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">View:</span>
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-lg transition-all duration-300 ${viewMode === 'grid'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`rounded-lg transition-all duration-300 ${viewMode === 'list'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Shops Grid/List */}
            {isLoading ? (
              <div className="space-y-8">
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 px-8 py-4 rounded-2xl shadow-lg border border-yellow-200">
                    <div className="animate-spin w-6 h-6 border-3 border-yellow-600 border-t-transparent rounded-full"></div>
                    <span className="font-semibold text-lg">Loading all jewelry stores...</span>
                  </div>
                </div>
                <div className={`grid gap-6 ${viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
                  }`}>
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-3xl shadow-lg overflow-hidden">
                      {/* Enhanced Skeleton matching the new card design */}
                      <div className="relative">
                        <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                        {/* Badges Skeleton */}
                        <div className="absolute top-4 left-4">
                          <div className="w-20 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <div className="w-16 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                      </div>

                      {/* Content Skeleton */}
                      <div className="p-6">
                        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full mb-3 animate-pulse"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full mb-4 w-3/4 animate-pulse"></div>
                        <div className="flex gap-2 mb-6">
                          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-16 animate-pulse"></div>
                          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-20 animate-pulse"></div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl w-28 animate-pulse"></div>
                          <div className="text-right">
                            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-8 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-12 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="text-6xl">🏪</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {shops.length === 0 ? 'No Stores Available' : 'No Matching Stores Found'}
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    {shops.length === 0
                      ? 'It seems there are no stores registered in the system currently. Check back later.'
                      : 'Try changing your search criteria or filters to find suitable stores'
                    }
                  </p>
                  {shops.length > 0 && (
                    <Button
                      onClick={() => {
                        setFilters({
                          location: '',
                          rating: '',
                          specialty: '',
                          sortBy: 'rating'
                        });
                        setSearchQuery('');
                        setSearchParams({});
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
                }`}>
                {filteredShops.map((shop, index) => (
                  <div
                    key={shop._id || shop.id}
                    className="opacity-0 animate-fade-in"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <ShopCard
                      shop={shop}
                      isListView={viewMode === 'list'}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced Load More */}
            {filteredShops.length > 0 && (
              <div className="text-center mt-16">
                <div className="relative inline-block">
                  {/* Background Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-lg opacity-20 animate-pulse"></div>

                  <Button
                    variant="outline"
                    size="lg"
                    className="relative border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      <span>Load More Stores</span>
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">+</span>
                      </div>
                    </span>
                  </Button>
                </div>

                {/* Subtitle */}
                <p className="text-gray-600 mt-4 text-lg">
                  Showing <span className="font-bold text-yellow-600">{filteredShops.length}</span> of many amazing stores
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopList;
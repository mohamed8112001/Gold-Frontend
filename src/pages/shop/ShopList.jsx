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
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../utils/constants.js';
import { shopService } from '../../services/shopService.js';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";


const ShopList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    specialties: '',
    sortBy: 'rating'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0
  });

  useEffect(() => {
    loadShops();
  }, [pagination.page, filters]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, shops]);

  // Initialize filteredShops when shops are loaded
  useEffect(() => {
    if (shops.length > 0 && filteredShops.length === 0 && !searchQuery) {
      console.log('🔄 Initializing filteredShops with', shops.length, 'shops');
      setFilteredShops([...shops]);
    }
  }, [shops, filteredShops.length, searchQuery]);

  const loadShops = async () => {
    try {
      setIsLoading(true);
      console.log('🏪 Loading shops for ShopList page...', JSON.stringify(filters));

      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await shopService.getAllShops(params);
      console.log('Shop API Response From page :', response);

      // Handle different response formats
      let shopsData = [];
      let total = 0;

      if (response.success && response.data) {
        // Format: { success: true, data: [...], meta: {...} }
        shopsData = response.data;
        total = response.meta?.total || response.data.length;
      } else if (Array.isArray(response)) {
        // Format: [shop1, shop2, ...]
        shopsData = response;
        total = response.length;
      } else if (response.data && Array.isArray(response.data)) {
        // Format: { data: [...] }
        shopsData = response.data;
        total = response.data.length;
      } else if (response.status === 'success' && response.data) {
        // Format: { status: 'success', data: [...] }
        shopsData = response.data;
        total = response.data.length;
      }

      console.log('🏪 Processed shops data:', shopsData.length, 'shops');
      console.log('🏪 Sample shop:', shopsData[0]);
      console.log('🏪 All shops:', shopsData);

      const newShops = pagination.page === 1
        ? shopsData
        : [...shops, ...shopsData];

      setShops(newShops);

      setPagination(prev => ({
        ...prev,
        total: total
      }));
    } catch (error) {
      console.error(' Error loading shops:', error);
      setShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('🔍 Starting applyFilters...');
    console.log('🔍 shops.length:', shops.length);
    console.log('🔍 searchQuery:', searchQuery);

    if (shops.length === 0) {
      console.log('🔍 No shops to filter, setting empty filtered shops');
      setFilteredShops([]);
      return;
    }

    let filtered = [...shops];

    console.log('🔍 Applying filters to', shops.length, 'shops');

    // Search filter - only apply if there's a search query
    if (searchQuery && searchQuery.trim() !== '') {
      console.log('🔍 Applying search filter for:', searchQuery);
      filtered = filtered.filter(shop => {
        const name = shop.name || '';
        const description = shop.description || '';
        const address = shop.address || shop.area || '';
        const specialties = shop.specialties || [];
        const ownerName = shop.ownerName || '';

        const matches = (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(specialties) && specialties.some(specialty =>
            specialty.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        );

        if (matches) {
          console.log('🔍 Shop matches search:', shop.name);
        }

        return matches;
      });
    } else {
      console.log('🔍 No search query, showing all', shops.length, 'shops');
      // When no search query, show all shops
      filtered = [...shops];
    }

    console.log('🔍 Final filtered shops:', filtered.length);
    console.log('🔍 Sample filtered shop:', filtered[0]?.name);
    setFilteredShops(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      page: prev.page + 1
    }));
  };

  const ShopCard = ({ shop, isListView = false }) => {
    const shopName = shop.name || 'Unnamed Shop';
    const shopAddress = shop.address || shop.area || shop.city || 'Address not specified';
    const shopPhone = shop.phone || shop.whatsapp || 'Not specified';
    const shopDescription = shop.description || 'No description available';
    const shopSpecialties = shop.specialties || [];
    const shopWorkingHours = shop.workingHours || '9:00 AM - 9:00 PM';

    // Debug shop image
    console.log('🖼️ Shop image debug:', {
      shopName: shop.name,
      logoUrl: shop.logoUrl,
      image: shop.image,
      imageUrl: shop.imageUrl,
      fullImageUrl: shop.logoUrl ? `${import.meta.env.VITE_API_BASE_URL}/shop-image/${shop.logoUrl}` : 'No image'
    });

    return (
      <Card
        className={`group relative overflow-hidden hover:shadow-2xl hover:-translate-y-4 transition-all duration-700 cursor-pointer border-0 bg-white rounded-3xl shadow-xl h-full flex flex-col ${isListView ? 'lg:flex-row lg:h-auto' : ''} backdrop-blur-sm hover:shadow-yellow-200/25`}
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
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-orange-50/20 to-yellow-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"></div>

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm -z-10"></div>
        <div className={`relative overflow-hidden rounded-t-3xl ${isListView ? 'lg:w-80 lg:flex-shrink-0 lg:rounded-l-3xl lg:rounded-tr-none' : 'w-full'} group-hover:rounded-t-2xl transition-all duration-700`}>
          {/* Premium image container with enhanced effects */}
          <div className="relative w-full h-96 md:h-80 lg:h-72 overflow-hidden">
            {shop.logoUrl && shop.logoUrl !== 'undefined' && shop.logoUrl !== '' && shop.logoUrl !== null ? (
              <>
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/shop-image/${shop.logoUrl}`}
                  alt={shopName}
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 ease-out"
                  onError={(e) => {
                    console.log('❌ Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.fallback-image');
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                  onLoad={(e) => {
                    console.log('✅ Image loaded successfully:', e.target.src);
                  }}
                />
                {/* Image overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </>
            ) : (
              console.log('🖼️ No logoUrl for shop:', shopName, 'logoUrl:', shop.logoUrl)
            )}

            {/* Premium fallback image with luxury design */}
            <div
              className={`fallback-image absolute inset-0 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200 flex items-center justify-center group-hover:from-yellow-200 group-hover:via-amber-100 group-hover:to-yellow-300 transition-all duration-700 ${shop.logoUrl && shop.logoUrl !== 'undefined' && shop.logoUrl !== '' && shop.logoUrl !== null ? 'hidden' : 'flex'}`}
            >
              <div className="text-center transform group-hover:scale-110 transition-transform duration-700">
                <div className="relative mb-6">
                  <div className="text-9xl mb-2 filter drop-shadow-2xl">💍</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-2xl"></div>
                </div>
                <div className="text-xl text-gray-800 font-bold px-6 py-3 bg-white/90 rounded-2xl backdrop-blur-md shadow-xl border-2 border-yellow-300 mb-3">
                  {shopName}
                </div>
                <div className="text-base text-gray-600 font-bold bg-yellow-100 px-4 py-2 rounded-full">Premium Jewelry Store</div>
              </div>
              {/* Enhanced decorative elements */}
              <div className="absolute top-6 left-6 w-4 h-4 bg-yellow-400 rounded-full opacity-70 animate-ping"></div>
              <div className="absolute bottom-6 right-6 w-3 h-3 bg-orange-400 rounded-full opacity-50 animate-pulse"></div>
              <div className="absolute top-1/3 left-4 w-2 h-2 bg-yellow-500 rounded-full opacity-60 animate-bounce"></div>
              <div className="absolute bottom-1/3 right-4 w-2 h-2 bg-amber-500 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>

          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Premium favorite button with enhanced design */}
          <div className="absolute top-5 right-5 z-20">
            <Button
              size="lg"
              variant="ghost"
              className="bg-white/95 hover:bg-white backdrop-blur-md rounded-full w-14 h-14 p-0 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-125 border-2 border-white/70"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Heart className="w-6 h-6 text-red-500 hover:text-red-600 transition-colors duration-200" />
            </Button>
          </div>

          {/* Premium status badge */}
          <div className="absolute top-5 left-5 z-20">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-5 py-3 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0 border-2 border-green-400/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-bold">Open Now</span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className={`p-10 flex-1 flex flex-col ${isListView ? 'lg:justify-center' : ''} relative z-20`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="font-bold text-3xl text-gray-900 mb-5 line-clamp-2 leading-tight group-hover:text-yellow-700 transition-colors duration-300 group-hover:scale-105 transform origin-left">
                {shopName}
              </h3>
              <div className="flex items-center text-base text-gray-600 ">
                <MapPin className={`w-6 h-6 mr-4 ${shop.location && shop.location.coordinates ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="line-clamp-1 font-semibold text-gray-700">{shopAddress}</span>
                {/* {shop.location && shop.location.coordinates && (
                  <span className="ml-4 text-sm bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-4 py-2 rounded-full font-bold shadow-md border border-green-300/50">
                    ✓ Verified Location
                  </span>
                )} */}
              </div>
              {isListView && (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center text-base text-gray-700 bg-blue-50 px-4 py-3 rounded-xl">
                    <Phone className="w-6 h-6 mr-4 text-blue-500" />
                    <span className="font-bold">{shopPhone}</span>
                  </div>
                  <div className="flex items-center text-base text-gray-700 bg-purple-50 px-4 py-3 rounded-xl">
                    <Clock className="w-6 h-6 mr-4 text-purple-500" />
                    <span className="font-bold">{shopWorkingHours}</span>
                  </div>
                  {/* <p className="text-base text-gray-600 mt-5 leading-relaxed bg-gray-50 p-4 rounded-xl">{shopDescription}</p> */}
                </div>
              )}
            </div>
          </div>

          {shopSpecialties.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8">
              {/* {shopSpecialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="text-base bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-5 py-3 rounded-full font-bold border border-gray-300/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-gray-200 hover:to-gray-300"
                >
                  ✨ {specialty}
                </span>
              ))} */}
              {shopSpecialties.length > 3 && (
                <span className="text-base bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-5 py-3 rounded-full font-bold border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  +{shopSpecialties.length - 3} More
                </span>
              )}
            </div>
          )}

          {/* Enhanced description for grid view */}
          {/* {!isListView && shopDescription && shopDescription !== 'No description available' && (
            <div className="mb-8">
              <p className="text-base text-gray-600 leading-relaxed line-clamp-3 bg-gray-50 p-5 rounded-xl border border-gray-200/50 font-medium">{shopDescription}</p>
            </div>
          )} */}

          {/* Premium footer section with enhanced buttons */}
          <div className="mt-auto pt-8">
            <div className="flex flex-col gap-4">
              {/* Main Visit Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 hover:from-yellow-600 hover:via-orange-500 hover:to-orange-600 text-white px-8 py-5 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-yellow-400/50 text-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  const shopId = shop._id || shop.id;
                  if (shopId) {
                    navigate(ROUTES.SHOP_DETAILS(shopId));
                  }
                }}
              >
                <Eye className="w-6 h-6 mr-3" />
                <span>Visit Shop</span>
              </Button>

              {/* Secondary Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 border-2 border-gray-300 hover:border-yellow-500 hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 py-3 rounded-xl font-semibold transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1 border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-700 py-3 rounded-xl font-semibold transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Location
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card >
    );
  };

  const FilterPanel = () => (
    <div className={`bg-white rounded-3xl shadow-xl border-0 p-8 h-fit sticky top-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
          <SlidersHorizontal className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-bold text-2xl text-gray-900">Search Filters</h3>
      </div>

      <div className="space-y-8">
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

        <div>
          <label className="block text-base font-bold text-gray-800 mb-4">
            Specialty
          </label>
          <Input
            placeholder="e.g: Rings, Necklaces, Bracelets"
            value={filters.specialties}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, specialties: e.target.value }))
            }}
            className="py-4 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 transition-colors duration-300 text-base font-medium"
          />
        </div>

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

        <Button
          variant="outline"
          onClick={() => {
            setFilters({
              location: '',
              rating: '',
              specialties: '',
              sortBy: 'rating'
            });
            setSearchQuery('');
            setSearchParams({});
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="w-full py-4 rounded-2xl border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 font-bold text-base"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 pt-20"
      dir="ltr"
    >
      <div className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 overflow-hidden mt-4">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent drop-shadow-2xl m-10">
                Discover Stores
              </span>
            </h1>

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

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
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

          <div className="flex-1">
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

            {isLoading && pagination.page === 1 ? (
              <div className="space-y-8">
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 px-8 py-4 rounded-2xl shadow-lg border border-yellow-200">
                    <div className="animate-spin w-6 h-6 border-3 border-yellow-600 border-t-transparent rounded-full"></div>
                    <span className="font-semibold text-lg">Loading jewelry stores...</span>
                  </div>
                </div>
                <div className={`grid gap-10 ${viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
                  : 'grid-cols-1 max-w-5xl mx-auto'
                  }`}>
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-3xl shadow-lg overflow-hidden">
                      <div className="relative">
                        <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
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
                          specialties: '',
                          sortBy: 'rating'
                        });
                        setSearchQuery('');
                        setSearchParams({});
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className={`grid gap-12 ${viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 max-w-6xl mx-auto'
                  }`}>
                  {filteredShops.map((shop, index) => (
                    <div
                      key={shop._id || shop.id || index}
                      className="opacity-0 animate-fade-in transform translate-y-4"
                      style={{
                        animationDelay: `${index * 0.15}s`,
                        animationFillMode: 'forwards',
                        animationDuration: '0.8s'
                      }}
                    >
                      <ShopCard
                        shop={shop}
                        isListView={viewMode === 'list'}
                      />
                    </div>
                  ))}
                </div>

                {filteredShops.length < pagination.total && (
                  <div className="text-center mt-16">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-lg opacity-20 animate-pulse"></div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={loadMore}
                        disabled={isLoading}
                        className="relative border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <span className="flex items-center gap-3">
                          {isLoading ? (
                            <>
                              <span>Loading...</span>
                              <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            </>
                          ) : (
                            <>
                              <span>Load More Stores</span>
                              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-sm">+</span>
                              </div>
                            </>
                          )}
                        </span>
                      </Button>
                    </div>
                    <p className="text-gray-600 mt-4 text-lg">
                      Showing {filteredShops.length} of {pagination.total} stores
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopList;
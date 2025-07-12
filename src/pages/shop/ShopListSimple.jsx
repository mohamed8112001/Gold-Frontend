import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
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

const ShopListSimple = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
      console.log('🏪 Loading all shops for universal access...');
      
      const response = await shopService.getAllShops();
      const shopsData = Array.isArray(response) ? response : response.data || response.shops || [];

      console.log('🏪 ShopList - Total shops from API:', shopsData.length);
      console.log('🏪 ShopList - Sample shop data:', shopsData[0]);

      // Show ALL shops - no filtering for shop list page
      setShops(shopsData);
      
      console.log('✅ All shops loaded successfully for universal access');
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

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(shop => {
        const name = shop.name || '';
        const description = shop.description || '';
        const address = shop.address || shop.area || '';
        const ownerName = shop.ownerName || '';

        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ownerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(shop => {
        const address = shop.address || shop.area || '';
        return address.toLowerCase().includes(filters.location.toLowerCase());
      });
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(shop => {
        const rating = shop.rating || 0;
        return rating >= parseFloat(filters.rating);
      });
    }

    console.log('🔍 Final filtered shops:', filtered.length);
    setFilteredShops(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
  };

  const ShopCard = ({ shop, isListView = false }) => {
    const shopName = shop.name || 'متجر غير محدد';
    const shopAddress = shop.area || shop.address || 'العنوان غير محدد';
    const shopPhone = shop.phone || 'غير محدد';
    const shopDescription = shop.description || 'لا يوجد وصف';
    const shopRating = shop.rating || 0;
    const shopSpecialties = shop.specialties || [];
    const shopWorkingHours = shop.workingHours || 'غير محدد';
    const shopImage = shop.image || null;

    return (
      <Card
        className={`group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${isListView ? 'flex flex-row' : ''}`}
        onClick={() => {
          const shopId = shop._id || shop.id;
          console.log('Navigating to shop:', shopId, shop.name);
          if (shopId) {
            navigate(ROUTES.SHOP_DETAILS(shopId));
          }
        }}
      >
        <div className={`relative overflow-hidden ${isListView ? 'w-48 flex-shrink-0' : 'w-full'}`}>
          {shopImage ? (
            <img
              src={shopImage}
              alt={shopName}
              className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${isListView ? 'h-full' : 'h-48'}`}
            />
          ) : (
            <div className={`bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center ${isListView ? 'h-full' : 'h-48'}`}>
              <div className="text-center">
                <div className="text-4xl mb-2">💍</div>
                <div className="text-sm text-gray-600 font-medium">{shopName}</div>
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/80 hover:bg-white shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                // Handle favorite functionality here
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="absolute top-2 left-2">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              متاح
            </span>
          </div>
        </div>

        <CardContent className={`p-4 ${isListView ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 truncate">{shopName}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className={`w-4 h-4 mr-1 ${shop.location && shop.location.coordinates ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="truncate">{shopAddress}</span>
                {shop.location && shop.location.coordinates && (
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    موقع محدد
                  </span>
                )}
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
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{shopDescription}</p>
                </div>
              )}
            </div>
            {shopRating > 0 && (
              <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full ml-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{shopRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {shopSpecialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {shopSpecialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const shopId = shop._id || shop.id;
                if (shopId) {
                  navigate(ROUTES.SHOP_DETAILS(shopId));
                }
              }}
              className="flex-1 mr-2"
            >
              <Eye className="w-4 h-4 mr-1" />
              عرض التفاصيل
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-50 to-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🏪 جميع متاجر المجوهرات
              </h1>
              <p className="text-lg text-gray-600">
                استكشف مجموعة شاملة من أفضل متاجر المجوهرات والذهب في مصر
              </p>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  متاح لجميع المستخدمين
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {filteredShops.length} متجر متاح
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="ابحث عن المتاجر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {filteredShops.length} من {shops.length} متجر
              </div>
            </div>

            {/* Shops Grid/List */}
            {isLoading ? (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3 bg-yellow-50 text-yellow-800 px-6 py-3 rounded-full">
                    <div className="animate-spin w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                    <span className="font-medium">جاري تحميل جميع المتاجر...</span>
                  </div>
                </div>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-48 rounded-t-lg"></div>
                      <div className="bg-white p-4 rounded-b-lg">
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-4 w-2/3"></div>
                        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🏪</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {shops.length === 0 ? 'لا توجد متاجر متاحة حالياً' : 'لم يتم العثور على متاجر مطابقة'}
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  {shops.length === 0 
                    ? 'يبدو أنه لا توجد متاجر مسجلة في النظام حالياً. تحقق مرة أخرى لاحقاً.'
                    : 'جرب تغيير معايير البحث للعثور على المتاجر المناسبة'
                  }
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredShops.map((shop, index) => (
                  <ShopCard
                    key={shop.id || shop._id || index}
                    shop={shop}
                    isListView={viewMode === 'list'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopListSimple;

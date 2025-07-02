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
        className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${isListView ? 'flex flex-row' : ''}`}
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
        <div className={`relative overflow-hidden ${isListView ? 'w-48 flex-shrink-0' : 'w-full'
          }`}>
          {shopImage ? (
            <img
              src={shopImage}
              alt={shopName}
              className={`w-full object-cover ${isListView ? 'h-full' : 'h-48'}`}
            />
          ) : (
            <div className={`bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center ${isListView ? 'h-full' : 'h-48'
              }`}>
              <div className="text-4xl">💍</div>
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

        <CardContent className={`p-4 ${isListView ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{shopName}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{shopAddress}</span>
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
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
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
              <Eye className="w-4 h-4 mr-1" />
              عرض المتجر
            </Button>
            <span className="text-xs text-gray-500">
              {shop.reviewCount || 0} تقييم
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FilterPanel = () => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${showFilters ? 'block' : 'hidden lg:block'
      }`}>
      <h3 className="font-bold text-lg mb-4">تصفية النتائج</h3>

      <div className="space-y-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الموقع
          </label>
          <Input
            placeholder="اختر المدينة"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التقييم الأدنى
          </label>
          <select
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">جميع التقييمات</option>
            <option value="4.5">4.5+ نجوم</option>
            <option value="4.0">4.0+ نجوم</option>
            <option value="3.5">3.5+ نجوم</option>
            <option value="3.0">3.0+ نجوم</option>
          </select>
        </div>

        {/* Specialty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            التخصص
          </label>
          <Input
            placeholder="مثل: خواتم، قلائد، أساور"
            value={filters.specialty}
            onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ترتيب حسب
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="rating">التقييم</option>
            <option value="reviews">عدد التقييمات</option>
            <option value="name">الاسم</option>
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
          className="w-full"
        >
          مسح الفلاتر
        </Button>
      </div>
    </div>
  );

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

              {/* Personalized welcome message based on user role */}
              {user && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    {user.role === 'admin' && (
                      <>👑 مرحباً أيها المدير! يمكنك رؤية وإدارة جميع المتاجر في النظام</>
                    )}
                    {user.role === 'shop_owner' && (
                      <>🏪 مرحباً صاحب المتجر! استكشف المتاجر الأخرى واحصل على الإلهام</>
                    )}
                    {user.role === 'customer' && (
                      <>💎 مرحباً عزيزي العميل! اكتشف أجمل متاجر المجوهرات واختر الأنسب لك</>
                    )}
                    {!user.role && (
                      <>🌟 مرحباً بك! استكشف جميع متاجر المجوهرات المتاحة</>
                    )}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  متاح لجميع المستخدمين
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {filteredShops.length} متجر متاح
                </div>
                {user && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    مسجل دخول كـ {user.role === 'admin' ? 'مدير' : user.role === 'shop_owner' ? 'صاحب متجر' : 'عميل'}
                  </div>
                )}
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
                  className="pl-10"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
              </Button>
            </div>
            <FilterPanel />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {filteredShops.length} متجر
                </span>
              </div>

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
                <div className={`grid gap-6 ${viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
                  }`}>
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
                    : 'جرب تغيير معايير البحث أو الفلاتر للعثور على المتاجر المناسبة'
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
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    مسح جميع الفلاتر
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
                }`}>
                {filteredShops.map((shop) => (
                  <ShopCard
                    key={shop._id || shop.id}
                    shop={shop}
                    isListView={viewMode === 'list'}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredShops.length > 0 && (
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

export default ShopList;
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
  Search,
  Filter,
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
      const response = await shopService.getAllShops();
      // Handle both array response and object with data property
      const shopsData = Array.isArray(response) ? response : response.data || response.shops || [];

      // Filter only approved shops for regular users - ULTRA STRICT FILTERING
      const approvedShops = shopsData.filter(shop => {
        console.log('Checking shop:', shop.name, {
          id: shop.id || shop._id,
          status: shop.status,
          approved: shop.approved,
          isActive: shop.isActive,
          createdAt: shop.createdAt,
          hasStatus: shop.hasOwnProperty('status'),
          hasApproved: shop.hasOwnProperty('approved'),
          hasIsActive: shop.hasOwnProperty('isActive')
        });

        // ULTRA STRICT: Only show if explicitly approved AND not pending
        const isExplicitlyApproved = (
          shop.status === 'approved' &&
          shop.status !== 'pending' &&
          shop.approved !== false &&
          shop.isActive !== false
        );

        // OR if approved field is explicitly true
        const isApprovedByField = (
          shop.approved === true &&
          shop.status !== 'pending'
        );

        // OR if isActive is explicitly true
        const isActiveApproved = (
          shop.isActive === true &&
          shop.status !== 'pending'
        );

        // LEGACY: Only for very old shops created before approval system
        // AND only if they don't have any pending indicators
        const isLegacyApproved = (
          !shop.hasOwnProperty('status') &&
          !shop.hasOwnProperty('approved') &&
          !shop.hasOwnProperty('isActive') &&
          !shop.status &&
          shop.approved !== false &&
          shop.isActive !== false &&
          // Additional check: if shop was created recently, it should have status
          (!shop.createdAt || new Date(shop.createdAt) < new Date('2024-01-01'))
        );

        const shouldShow = isExplicitlyApproved || isApprovedByField || isActiveApproved || isLegacyApproved;

        console.log(`Shop "${shop.name}":
          - explicitly approved = ${isExplicitlyApproved}
          - approved by field = ${isApprovedByField}
          - active approved = ${isActiveApproved}
          - legacy approved = ${isLegacyApproved}
          - FINAL DECISION = ${shouldShow}`);

        return shouldShow;
      });

      console.log('All shops loaded:', shopsData.length);
      console.log('Approved shops to show:', approvedShops.length);
      console.log('Filtered out shops:', shopsData.length - approvedShops.length);

      setShops(approvedShops);
    } catch (error) {
      console.error('Error loading shops:', error);
      // Show empty state instead of mock data
      setShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...shops];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(shop => {
        const name = shop.name || '';
        const description = shop.description || '';
        const address = shop.address || '';
        const specialties = shop.specialties || [];

        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(specialties) && specialties.some(specialty =>
            specialty.toLowerCase().includes(searchQuery.toLowerCase())
          ))
        );
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(shop => {
        const address = shop.address || '';
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

    setFilteredShops(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { search: searchQuery } : {});
  };

  const mockShops = [
    {
      id: 1,
      name: 'Royal Gold Cairo',
      nameAr: 'رويال جولد القاهرة',
      location: 'Downtown, Cairo',
      locationAr: 'وسط البلد، القاهرة',
      rating: 4.8,
      reviewCount: 156,
      image: '/api/placeholder/300/200',
      specialties: ['خواتم', 'قلائد', 'أساور'],
      phone: '+20 2 1234567',
      openingHours: '9:00 AM - 10:00 PM',
      description: 'متجر مجوهرات راقي يقدم أفضل التصاميم الذهبية والماسية'
    },
    {
      id: 2,
      name: 'Alexandria Jewels',
      nameAr: 'مجوهرات الإسكندرية',
      location: 'Corniche, Alexandria',
      locationAr: 'الكورنيش، الإسكندرية',
      rating: 4.5,
      reviewCount: 89,
      image: '/api/placeholder/300/200',
      specialties: ['أقراط', 'سلاسل', 'طقم عروس'],
      phone: '+20 3 1234567',
      openingHours: '10:00 AM - 9:00 PM',
      description: 'تشكيلة واسعة من المجوهرات العصرية والكلاسيكية'
    },
    {
      id: 3,
      name: "Pharaoh's Treasures",
      nameAr: 'كنوز الفراعنة',
      location: 'Zamalek, Cairo',
      locationAr: 'الزمالك، القاهرة',
      rating: 4.9,
      reviewCount: 234,
      image: '/api/placeholder/300/200',
      specialties: ['تصميم فرعوني', 'تصميم مخصص', 'أحجار كريمة'],
      phone: '+20 2 2345678',
      openingHours: '9:30 AM - 10:30 PM',
      description: 'تصاميم مستوحاة من الحضارة المصرية القديمة'
    },
    // Add more mock shops...
  ];

  const ShopCard = ({ shop, isListView = false }) => {
    // Handle missing data gracefully
    const shopName = shop.name || 'متجر غير محدد';
    const shopAddress = shop.address || 'العنوان غير محدد';
    const shopPhone = shop.phone || 'غير محدد';
    const shopDescription = shop.description || 'لا يوجد وصف';
    const shopRating = shop.rating || 0;
    const shopSpecialties = shop.specialties || [];
    const shopWorkingHours = shop.workingHours || 'غير محدد';
    const shopImage = shop.image || null;

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
                navigate(ROUTES.SHOP_DETAILS(shop.id));
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">متاجر المجوهرات</h1>
              <p className="text-gray-600 mt-1">
                اكتشف أفضل متاجر المجوهرات في مصر
              </p>
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
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  لم يتم العثور على متاجر
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
                {filteredShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
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


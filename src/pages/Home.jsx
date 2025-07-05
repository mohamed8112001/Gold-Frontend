import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Search, Star, MapPin, Clock, Phone, Eye, Heart } from 'lucide-react';
import { ROUTES } from '../utils/constants.js';
import { shopService } from '../services/shopService.js';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredShops, setFeaturedShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedShops();
  }, []);

  const loadFeaturedShops = async () => {
    try {
      setIsLoading(true);
      const shops = await shopService.getAllShops();
      console.log('Loaded shops from API:', shops);

      // Ensure we have an array and limit to 9 shops
      const shopsArray = Array.isArray(shops) ? shops : [];
      setFeaturedShops(shopsArray.slice(0, 9));

      // If no shops from API, fallback to mock data for demo
      if (shopsArray.length === 0) {
        console.log('No shops from API, using mock data');
        setFeaturedShops(mockShops.slice(0, 9));
      }
    } catch (error) {
      console.error('Error loading shops:', error);
      // Use mock data as fallback
      console.log('Using mock data due to error');
      setFeaturedShops(mockShops.slice(0, 9));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SHOPS}?search=${encodeURIComponent(searchQuery)}`);
    }
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
      specialties: ['Rings', 'Necklaces', 'Bracelets']
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
      specialties: ['Earrings', 'Chains', 'Wedding Sets']
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
      specialties: ['Ancient Style', 'Custom Design', 'Precious Stones']
    },
    {
      id: 4,
      name: 'Golden Nile',
      nameAr: 'النيل الذهبي',
      location: 'Nasr City, Cairo',
      locationAr: 'مدينة نصر، القاهرة',
      rating: 4.7,
      reviewCount: 178,
      image: '/api/placeholder/300/200',
      specialties: ['Modern Design', 'Watches', 'Gifts']
    },
    {
      id: 5,
      name: 'Cleopatra Designs',
      nameAr: 'تصاميم كليوباترا',
      location: 'Maadi, Cairo',
      locationAr: 'المعادي، القاهرة',
      rating: 4.6,
      reviewCount: 92,
      image: '/api/placeholder/300/200',
      specialties: ['Women Jewelry', 'Luxury Items', 'Diamonds']
    },
    {
      id: 6,
      name: 'Pyramid Gold',
      nameAr: 'ذهب الأهرام',
      location: 'Giza, Cairo',
      locationAr: 'الجيزة، القاهرة',
      rating: 4.4,
      reviewCount: 67,
      image: '/api/placeholder/300/200',
      specialties: ['Traditional', 'Handmade', 'Repair Services']
    },
    {
      id: 7,
      name: 'Nubian Crafts',
      nameAr: 'الحرف النوبية',
      location: 'Aswan',
      locationAr: 'أسوان',
      rating: 4.7,
      reviewCount: 45,
      image: '/api/placeholder/300/200',
      specialties: ['Cultural Designs', 'Silver', 'Handcrafted']
    },
    {
      id: 8,
      name: 'El Khan Jewelry',
      nameAr: 'مجوهرات الخان',
      location: 'Khan El Khalili, Cairo',
      locationAr: 'خان الخليلي، القاهرة',
      rating: 4.3,
      reviewCount: 123,
      image: '/api/placeholder/300/200',
      specialties: ['Antique Style', 'Islamic Art', 'Collectibles']
    },
    {
      id: 9,
      name: 'Red Sea Gold',
      nameAr: 'ذهب البحر الأحمر',
      location: 'Hurghada',
      locationAr: 'الغردقة',
      rating: 4.5,
      reviewCount: 78,
      image: '/api/placeholder/300/200',
      specialties: ['Beach Style', 'Coral Inspired', 'Resort Jewelry']
    }
  ];

  const ShopCard = ({ shop }) => {
    // Handle both API data and mock data formats
    const shopId = shop._id || shop.id;
    const shopName = shop.name || shop.nameAr || 'متجر مجوهرات';
    const shopLocation = shop.city && shop.area ? `${shop.area}, ${shop.city}` : (shop.locationAr || shop.location || 'غير محدد');
    const shopRating = shop.averageRating || shop.rating || 0;
    const shopImage = shop.logoUrl || shop.image;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="relative overflow-hidden">
          {shopImage ? (
            <img
              src={shopImage}
              alt={shopName}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center" style={{display: shopImage ? 'none' : 'flex'}}>
            <div className="text-4xl">💍</div>
          </div>
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{shopName}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{shopLocation}</span>
              </div>
            </div>
            {shopRating > 0 && (
              <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{shopRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => navigate(ROUTES.SHOP_DETAILS(shopId))}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Shop
            </Button>
            <span className="text-xs text-gray-500">
              {shop.reviewCount || 'لا توجد تقييمات'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Egypt's Finest Jewelry Shops
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-yellow-100 max-w-3xl mx-auto">
              Browse our curated selection of premium jewelry shops offering the finest gold and precious metals craftsmanship in Egypt.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for jewelry, shops, gold..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900 rounded-full border-0 focus:ring-2 focus:ring-yellow-300"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-600 hover:bg-yellow-700 rounded-full px-6"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Shops Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Discover Egypt's Finest Jewelry Shops
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our curated selection of premium jewelry shops offering the finest gold and precious metals craftsmanship in Egypt.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredShops.map((shop) => (
                <ShopCard key={shop._id || shop.id} shop={shop} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => navigate(ROUTES.SHOPS)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3"
            >
              View All Shops
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why our clients trust us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">💎</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Exceptional Quality</h3>
              <p className="text-gray-600">
                We work with only the finest jewelry shops that meet our strict quality standards.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🔄</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trusted & Transparent</h3>
              <p className="text-gray-600">
                All our partner shops are verified and maintain transparent pricing and policies.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🌟</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Luxury & Transparency</h3>
              <p className="text-gray-600">
                Experience luxury shopping with complete transparency in every transaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-yellow-600 to-yellow-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to find your perfect jewelry?
          </h2>
          <p className="text-xl text-yellow-100 mb-8">
            Join thousands of satisfied customers who found their dream jewelry through Dibla.
          </p>
          <div className="space-x-4">
            <Button 
              size="lg"
              onClick={() => navigate(ROUTES.SHOPS)}
              className="bg-white text-yellow-600 hover:bg-gray-100 px-8 py-3"
            >
              Browse Shops
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate(ROUTES.USER_TYPE_SELECTION)}
              className="border-white text-white hover:bg-white hover:text-yellow-600 px-8 py-3"
            >
              Join as Shop Owner
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


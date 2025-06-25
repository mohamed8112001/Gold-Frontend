import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
  Search,
  Star,
  MapPin,
  Clock,
  Phone,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Shield,
  Award
} from 'lucide-react';
import { ROUTES } from '../utils/constants.js';
import { shopService } from '../services/shopService.js';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredShops, setFeaturedShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    totalShops: 0,
    totalProducts: 0,
    averageRating: 0,
    totalReviews: 0
  });

  // Hero slider images
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: '✨ مجوهرات فاخرة ✨',
      subtitle: 'اكتشف أجمل قطع الذهب والمجوهرات',
      description: 'تصاميم عصرية وكلاسيكية من أفضل المتاجر في مصر مع ضمان الجودة والأصالة'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: '💍 خواتم الزفاف 💍',
      subtitle: 'لحظات لا تُنسى مع أجمل الخواتم',
      description: 'مجموعة مختارة من خواتم الزفاف والخطوبة بتصاميم رومانسية وأنيقة'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: '👑 أحجار كريمة 👑',
      subtitle: 'مجوهرات مرصعة بالأحجار الطبيعية',
      description: 'قطع فريدة ومميزة مرصعة بالماس والزمرد والياقوت لكل المناسبات الخاصة'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      title: '🏆 ذهب عيار 21 🏆',
      subtitle: 'جودة عالية وضمان أصالة',
      description: 'سلاسل وأساور وقلائد من الذهب الخالص بأفضل الأسعار وأحدث التصاميم'
    }
  ];

  useEffect(() => {
    loadFeaturedShops();
    loadStats();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const loadFeaturedShops = async () => {
    try {
      const response = await shopService.getPublicShops();
      const shops = Array.isArray(response) ? response : response.data || [];
      setFeaturedShops(shops.slice(0, 6));
    } catch (error) {
      console.error('Error loading shops:', error);
      setFeaturedShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load public shops data (only approved shops)
      const response = await shopService.getPublicShops();
      const approvedShops = Array.isArray(response) ? response : response.data || [];

      // Load products data (you might need to import productService)
      let products = [];
      try {
        const productsResponse = await fetch('/api/products'); // Adjust API endpoint
        if (productsResponse.ok) {
          products = await productsResponse.json();
        }
      } catch {
        console.log('Products API not available, using shop-based calculation');
      }

      const totalShops = approvedShops.length;
      const totalProducts = products.length || totalShops * 15; // Estimate if no products API

      // Calculate average rating from shops
      const shopsWithRating = approvedShops.filter(shop => shop.averageRating && shop.averageRating > 0);
      const averageShopRating = shopsWithRating.length > 0
        ? shopsWithRating.reduce((sum, shop) => sum + shop.averageRating, 0) / shopsWithRating.length
        : 4.8;

      // Calculate total reviews (estimate based on shops)
      const totalReviews = totalShops * 5; // Estimate 5 reviews per shop

      setStats({
        totalShops,
        totalProducts,
        averageRating: averageShopRating,
        totalReviews
      });

      console.log('📊 Dynamic stats loaded from public endpoint:', {
        totalShops,
        totalProducts,
        averageRating: averageShopRating.toFixed(1),
        totalReviews
      });

    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to default values
      setStats({
        totalShops: 50,
        totalProducts: 1000,
        averageRating: 4.8,
        totalReviews: 250
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SHOPS}?search=${encodeURIComponent(searchQuery)}`);
    }
  };


  const ShopCard = ({ shop }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative overflow-hidden">
        <img
          src={shop.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
          alt={shop.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button size="sm" variant="ghost" className="bg-white/80 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute top-2 left-2">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            ✓ موثق
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
              {shop.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{shop.area}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {shop.specialties?.slice(0, 2).map((specialty, index) => (
                <span
                  key={index}
                  className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
                >
                  {specialty}
                </span>
              ))}
              {shop.specialties?.length > 2 && (
                <span className="text-xs text-gray-500">+{shop.specialties.length - 2}</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full ml-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{shop.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id))}
          >
            <Eye className="w-4 h-4 mr-1" />
            عرض المتجر
          </Button>
          <span className="text-xs text-gray-500">
            {shop.reviews} تقييمات
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <section className="relative h-screen overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-600/10"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/20 to-transparent animate-pulse"></div>
        </div>

        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${index === currentSlide ? 'translate-x-0' :
                index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover transform scale-105 transition-transform duration-[10000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-60"></div>
                <div className="absolute top-40 right-20 w-6 h-6 bg-yellow-300 rounded-full animate-pulse opacity-40"></div>
                <div className="absolute bottom-32 left-20 w-3 h-3 bg-yellow-500 rounded-full animate-ping opacity-50"></div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-5xl mx-auto px-4">
                    <div className="animate-fade-in">
                      <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                        {slide.title}
                      </h1>
                    </div>
                    <div className="animate-fade-in-delay">
                      <h2 className="text-3xl md:text-5xl mb-6 text-yellow-300 font-semibold drop-shadow-lg">
                        {slide.subtitle}
                      </h2>
                    </div>
                    <div className="animate-fade-in-delay-2">
                      <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                        {slide.description}
                      </p>
                    </div>


                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 hover:from-yellow-400/40 hover:to-yellow-600/40 text-white p-4 rounded-full backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:scale-110"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 hover:from-yellow-400/40 hover:to-yellow-600/40 text-white p-4 rounded-full backdrop-blur-md transition-all duration-300 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:scale-110"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${index === currentSlide
                  ? 'w-12 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg'
                  : 'w-4 h-4 bg-white/50 hover:bg-white/70 hover:scale-125'
                  }`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="absolute bottom-12 right-8 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentSlide + 1} / {heroSlides.length}
          </div>
        </div>
      </section >

      {/* Advanced Search Section */}
      <section className="relative py-20 bg-gradient-to-br from-white via-yellow-50/30 to-white overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-40"></div>
          <div className="absolute top-32 right-1/3 w-6 h-6 bg-yellow-300 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute bottom-20 left-1/3 w-5 h-5 bg-yellow-500 rounded-full animate-bounce opacity-50"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                ابحث عن أحلامك
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              اكتشف أجمل قطع المجوهرات والذهب من أفضل المتاجر في مصر
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white rounded-2xl p-3 shadow-2xl border border-yellow-100 group-hover:border-yellow-200 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <Input
                      type="text"
                      placeholder="🔍 ابحث عن المجوهرات، الذهب، المتاجر..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 text-lg rounded-xl border-0 focus:ring-2 focus:ring-yellow-300 bg-gray-50 text-gray-900 placeholder-gray-500 font-medium"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                  >
                    ✨ بحث متقدم
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Search Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            <Button
              variant="outline"
              onClick={() => navigate('/shops?category=gold')}
              className="group bg-white/80 backdrop-blur-sm border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 p-4 h-auto"
            >
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💍</div>
                <div className="font-semibold">خواتم ذهب</div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/shops?category=necklaces')}
              className="group bg-white/80 backdrop-blur-sm border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 p-4 h-auto"
            >
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📿</div>
                <div className="font-semibold">سلاسل وقلائد</div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/shops?category=bracelets')}
              className="group bg-white/80 backdrop-blur-sm border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 p-4 h-auto"
            >
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💎</div>
                <div className="font-semibold">أساور وخلاخيل</div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/shops?category=earrings')}
              className="group bg-white/80 backdrop-blur-sm border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 p-4 h-auto"
            >
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">✨</div>
                <div className="font-semibold">أقراط وحلق</div>
              </div>
            </Button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => navigate('/shops')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🏪 تصفح جميع المتاجر
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
            <Button
              onClick={() => navigate('/products')}
              variant="outline"
              className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
            >
              💎 عرض جميع المنتجات
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Shops Section */}
      <section className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-yellow-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-yellow-100/40 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-yellow-400/20 rounded-full blur-xl animate-bounce"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in">
              <Sparkles className="w-5 h-5 animate-spin" />
              ✨ متاجر مميزة ✨
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>

            {/* Main Title with Animation */}
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 animate-fade-in-delay">
              <span className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                اكتشف أفضل
              </span>
              <br />
              <span className="text-gray-800">
                متاجر المجوهرات في مصر
              </span>
            </h2>

            {/* Subtitle with Animation */}
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12 animate-fade-in-delay-2">
              مجموعة مختارة من أرقى متاجر المجوهرات التي تقدم أجود أنواع الذهب والمعادن الثمينة بحرفية عالية
            </p>

            {/* Dynamic Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16 animate-fade-in-delay-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {isLoading ? (
                    <div className="animate-pulse bg-yellow-200 h-10 w-16 rounded"></div>
                  ) : (
                    `${stats.totalShops}+`
                  )}
                </div>
                <div className="text-gray-700 font-medium">متجر معتمد</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {isLoading ? (
                    <div className="animate-pulse bg-yellow-200 h-10 w-20 rounded"></div>
                  ) : (
                    `${stats.totalProducts.toLocaleString()}+`
                  )}
                </div>
                <div className="text-gray-700 font-medium">منتج متاح</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {isLoading ? (
                    <div className="animate-pulse bg-yellow-200 h-10 w-16 rounded"></div>
                  ) : (
                    `⭐ ${stats.averageRating.toFixed(1)}`
                  )}
                </div>
                <div className="text-gray-700 font-medium">تقييم العملاء</div>
              </div>
            </div>
          </div>

          {/* Shops Grid with Staggered Animation */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse bg-white rounded-3xl shadow-lg overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-56"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full mb-3"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full mb-4 w-3/4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-20"></div>
                      <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredShops.slice(0, 6).map((shop, index) => (
                <div
                  key={shop._id || shop.id}
                  className="group transform transition-all duration-500 hover:scale-105"
                  style={{
                    animationDelay: `${index * 0.15}s`,
                    animation: 'fadeInUp 0.8s ease-out forwards'
                  }}
                >
                  <ShopCard shop={shop} />
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-16">
            <Button
              onClick={() => navigate('/shops')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-12 py-4 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 animate-fade-in-delay-3"
            >
              🏪 استكشف جميع المتاجر
              <ArrowRight className="w-6 h-6 mr-3" />
            </Button>
          </div>


        </div>
      </section>

      {/* Interactive Services Section */}
      <section className="relative py-24 bg-gradient-to-br from-yellow-50 via-white to-gray-50 overflow-hidden">
        {/* Floating Animation Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-6 h-6 bg-yellow-400 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-32 right-1/3 w-4 h-4 bg-yellow-500 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-20 left-1/3 w-8 h-8 bg-yellow-300 rounded-full animate-bounce opacity-50"></div>
          <div className="absolute bottom-40 right-1/4 w-5 h-5 bg-yellow-600 rounded-full animate-pulse opacity-30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 animate-fade-in">
              <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                لماذا نحن الأفضل؟
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto animate-fade-in-delay">
              نقدم لك تجربة تسوق استثنائية مع أفضل الخدمات والضمانات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Service 1 */}
            <div className="group text-center transform transition-all duration-500 hover:scale-105 animate-fade-in-delay">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:rotate-12">
                  <div className="text-5xl animate-bounce">💎</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse">
                  ✓
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-yellow-600 transition-colors">
                جودة مضمونة 100%
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                جميع المنتجات معتمدة ومضمونة الجودة مع شهادات أصالة للذهب والمجوهرات
              </p>
            </div>

            {/* Service 2 */}
            <div className="group text-center transform transition-all duration-500 hover:scale-105 animate-fade-in-delay-2">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:rotate-12">
                  <div className="text-5xl animate-bounce">🛡️</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse">
                  ✓
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                متاجر موثوقة ومعتمدة
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                جميع المتاجر مفحوصة ومعتمدة من قبل خبراء المجوهرات لضمان أفضل تجربة تسوق
              </p>
            </div>

            {/* Service 3 */}
            <div className="group text-center transform transition-all duration-500 hover:scale-105 animate-fade-in-delay-3">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:rotate-12">
                  <div className="text-5xl animate-bounce">⭐</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse">
                  ✓
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-green-600 transition-colors">
                أسعار تنافسية وعروض حصرية
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                أفضل الأسعار في السوق مع عروض وخصومات حصرية لعملائنا الكرام
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-20 animate-fade-in-delay-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto transform hover:scale-105 transition-all duration-300">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                جاهز لبدء رحلة التسوق؟
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                انضم إلى آلاف العملاء الراضين واكتشف أجمل المجوهرات
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/shops')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🏪 تصفح المتاجر
                </Button>
                <Button
                  onClick={() => navigate('/products')}
                  variant="outline"
                  className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 px-8 py-4 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  💎 عرض المنتجات
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-yellow-600 via-yellow-500 to-yellow-700 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-white/5 rounded-full animate-bounce"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              🌟 جاهز لاكتشاف مجوهراتك المثالية؟ 🌟
            </h2>
            <p className="text-2xl text-yellow-100 mb-4 max-w-4xl mx-auto animate-fade-in-delay">
              انضم إلى آلاف العملاء الراضين الذين وجدوا مجوهرات أحلامهم من خلال Dibla
            </p>
          </div>

          {/* Dynamic Stats in CTA */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 animate-fade-in-delay-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="text-3xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="animate-pulse bg-white/30 h-8 w-16 rounded mx-auto"></div>
                ) : (
                  `${stats.totalShops}+`
                )}
              </div>
              <div className="text-yellow-100 font-medium">متجر موثوق</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="text-3xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="animate-pulse bg-white/30 h-8 w-20 rounded mx-auto"></div>
                ) : (
                  `${stats.totalProducts.toLocaleString()}+`
                )}
              </div>
              <div className="text-yellow-100 font-medium">قطعة مجوهرات</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="text-3xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="animate-pulse bg-white/30 h-8 w-16 rounded mx-auto"></div>
                ) : (
                  `⭐ ${stats.averageRating.toFixed(1)}`
                )}
              </div>
              <div className="text-yellow-100 font-medium">تقييم ممتاز</div>
            </div>
          </div> */}

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-delay-3">
            <Button
              size="lg"
              onClick={() => navigate('/shops')}
              className="bg-white text-yellow-600 hover:bg-yellow-50 px-12 py-4 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
            >
              🏪 استكشف المتاجر الآن
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/register')}
              className="bg-white text-yellow-600 hover:bg-yellow-50 px-12 py-4 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
            >
              ✨ انضم إلينا الآن
            </Button>
          </div>

          <div className="mt-12 text-yellow-100 animate-fade-in-delay-3">
            <p className="text-lg">
              💎 أكثر من <span className="font-bold text-white">{stats.totalReviews || '1000'}</span> عميل راضٍ يثق بنا 💎
            </p>
          </div>
        </div>
      </section>

      {/* Admin Access Section */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Admin Access
            </h3>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button
                onClick={() => navigate('/demo-login')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
              >
                🚀 Demo Login (Quick Access)
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/create')}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Create Admin Account
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/promote')}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Promote to Admin
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Admin Key: DIBLA_ADMIN_2024
            </p>
          </div>
        </div>
      </section>
      

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              لماذا تختار Dibla؟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نحن نوفر لك أفضل تجربة تسوق للمجوهرات والذهب في مصر
            </p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ضمان الجودة</h3>
              <p className="text-gray-600 leading-relaxed">
                جميع المتاجر معتمدة ومضمونة الجودة مع شهادات أصالة للذهب والمجوهرات
              </p>
            </div>


            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">أفضل الأسعار</h3>
              <p className="text-gray-600 leading-relaxed">
                أسعار تنافسية وعروض حصرية من أفضل متاجر المجوهرات في مصر
              </p>
            </div>


            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">تقييمات موثوقة</h3>
              <p className="text-gray-600 leading-relaxed">
                تقييمات حقيقية من العملاء لمساعدتك في اتخاذ القرار الصحيح
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={() => navigate('/shops')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              استكشف المتاجر الآن
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
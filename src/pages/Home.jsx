import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
  Search,
  Star,
  MapPin,
  Phone,
  Eye,
  Shield,
  Award
} from 'lucide-react';
import { ROUTES } from '../utils/constants.js';
import { shopService } from '../services/shopService.js';
import FloatingChat from '../components/ui/FloatingChat.jsx';
import StarRating from '../components/ui/StarRating.jsx';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// import api from '@/services/api.js';
import.meta.env.VITE_API_BASE_URL

import ConversationsFloatinButton from '@/components/chat/ConversationsFloatinButton.jsx';
import { useAuth } from '@/context/AuthContext.jsx';

const Home = () => {
  const { user } = useAuth()
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



  const heroSlides = [
    {
      id: 1,
      title: 'المجوهرات الفاخرة',
      subtitle: 'اكتشف أجود قطع الذهب والمجوهرات',
      description: 'تصاميم استثنائية وجودة عالية تليق بذوقك الرفيع',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-amber-300 to-yellow-600'
    },
    {
      id: 2,
      title: 'خواتم الزفاف',
      subtitle: 'لحظات لا تُنسى مع أجمل الخواتم',
      description: 'رمز الحب الأبدي بتصاميم فريدة ومميزة',
      image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-yellow-400 to-orange-500'
    },
    {
      id: 3,
      title: 'الأحجار الكريمة',
      subtitle: 'مجوهرات مرصعة بالأحجار الطبيعية',
      description: 'بريق طبيعي وجمال خالد يضفي لمسة ساحرة',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-[#D3BB92] to-[#8A6C37]'
    },
    {
      id: 4,
      title: 'ذهب عيار ٢١',
      subtitle: 'جودة عالية مع ضمان الأصالة',
      description: 'أنقى أنواع الذهب بشهادات جودة معتمدة',
      image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-[#A37F41] to-[#C5A56D]'
    },
    {
      id: 5,
      title: 'أناقة اللؤلؤ',
      subtitle: 'جمال خالد للؤلؤ الطبيعي',
      description: 'رقي وأناقة تعكس شخصيتك المميزة',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-[#F0E8DB] to-[#92723A]'
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
    }, 3000); // Change slide every 5 seconds

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
      const response = await shopService.getAllShops();
      const shops = Array.isArray(response) ? response : response.data || [];
      setFeaturedShops(shops.slice(0, 4)); // Only load 4 shops for premium display
    } catch (error) {
      console.error('Error loading shops:', error);
      setFeaturedShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Step 1: Load public shops
      const response = await shopService.getAllShops();
      const approvedShops = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
          

      // Step 2: Load products
      let products = [];

      try {
        const token = localStorage.getItem("token");
        console.log(" Fetching products from /product...");
        console.log(" Token used:", token);

        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const productsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/product`, {
          headers,
        });

        if (!productsResponse.ok) {
          throw new Error(`Product API error: ${productsResponse.status}`);
        }

        products = await productsResponse.json();
        console.log(" Products fetched:", products.length);
      } catch (error) {
        console.warn(' Products API not available or failed:', error.message);
      }

      // Step 3: Calculate stats
      const totalShops = approvedShops.length;
      const totalProducts = products.length;
      // const totalProducts = Array.isArray(products) ? products.length : approvedShops.length * 10;

      const shopsWithRating = approvedShops.filter(
        (shop) => shop.averageRating && shop.averageRating > 0
      );

      const averageShopRating =
        shopsWithRating.length > 0
          ? shopsWithRating.reduce((sum, shop) => sum + shop.averageRating, 0) /
          shopsWithRating.length
          : 4.8;

      const totalReviews = totalShops * 5;

      // Step 4: Set final stats
      setStats({
        totalShops,
        totalProducts,
        averageRating: averageShopRating,
        totalReviews,
      });

      console.log(' Dynamic stats loaded:', {
        totalShops,
        totalProducts,
        averageRating: averageShopRating.toFixed(1),
        totalReviews,
      });

    } catch (error) {
      console.error(' Error loading stats:', error.message, error);

      // Step 5: Fallback values
      setStats({
        totalShops: 50,
        totalProducts: 1000,
        averageRating: 4.8,
        totalReviews: 250,
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('hello');

    navigate(`${ROUTES.SHOPS}?search=${encodeURIComponent(searchQuery)}`);

  };


  const ShopCard = ({ shop }) => {
    // Debug shop image
    console.log(' Home Shop image debug:', {
      shopName: shop.name,
      logoUrl: shop.logoUrl,
      image: shop.image,
      imageUrl: shop.imageUrl,
      fullImageUrl: shop.logoUrl ? `${import.meta.env.VITE_API_BASE_URL}/shop-image/${shop.logoUrl}` : 'No image'
    });

    return (
      <Card
        className="group relative overflow-hidden bg-white rounded-3xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border-0"
        onClick={() => {
          const shopId = shop._id || shop.id;
          if (shopId) {
            navigate(ROUTES.SHOP_DETAILS(shopId));
          }
        }}
      >
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8E6]/50 via-transparent to-[#FFF0CC]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Enhanced Image Section */}
        <div className="relative overflow-hidden rounded-t-3xl">
          {/* Try to show real shop image first */}
          {shop.logoUrl && shop.logoUrl !== 'undefined' && shop.logoUrl !== '' && shop.logoUrl !== null ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/shop-image/${shop.logoUrl}`}
              alt={shop.name}
              className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                console.log(' Home image failed to load:', e.target.src);
                // Hide the image and show fallback
                e.target.style.display = 'none';
                const fallback = e.target.parentElement.querySelector('.fallback-image');
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
              onLoad={(e) => {
                console.log(' Home image loaded successfully:', e.target.src);
              }}
            />
          ) : (
            console.log(' No logoUrl for home shop:', shop.name, 'logoUrl:', shop.logoUrl)
          )}

          {/* Premium fallback image */}
          <div
            className={`fallback-image absolute inset-0 bg-gradient-to-br from-[#FFF0CC] via-[#FFF8E6] to-[#FFE6B3] flex items-center justify-center group-hover:from-[#FFE6B3] group-hover:via-[#FFF0CC] group-hover:to-[#FFDB99] transition-all duration-700 ${shop.logoUrl && shop.logoUrl !== 'undefined' && shop.logoUrl !== '' && shop.logoUrl !== null ? 'hidden' : 'flex'}`}
          >
            <div className="text-center transform group-hover:scale-110 transition-transform duration-700">
              <div className="relative mb-4">
                <div className="text-7xl mb-2 filter drop-">💍</div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#C37C00]/30 to-[#E6A500]/30 rounded-full blur-xl"></div>
              </div>
              <div className="text-lg text-gray-800 font-bold font-cairo px-4 py-2 bg-white/90 rounded-xl backdrop-blur-md border border-[#E2D2B6]">
                {shop.name}
              </div>
              <div className="mt-2 text-sm text-gray-600 font-semibold font-tajawal bg-[#F0E8DB] px-3 py-1 rounded-full">متجر مجوهرات</div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-[#C37C00] rounded-full opacity-60 animate-ping"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-[#C5A56D] rounded-full opacity-40 animate-pulse"></div>
          </div>

          {/* Enhanced Gradient Overlay on Image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>


          {/* Verified Badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
              <span className="font-semibold">✓ Verified</span>
            </div>
          </div>

        </div>

        {/* Enhanced Content Section */}
        <CardContent className="p-8 relative z-10">
          {/* Store Name */}
          <h3 className="font-bold font-cairo text-2xl text-gray-900 mb-4 line-clamp-1 group-hover:text-[#C37C00] transition-colors duration-300">
            {shop.name || 'متجر مجوهرات'}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-[#F0E8DB] to-[#E2D2B6] rounded-full flex items-center justify-center mr-3">
              <MapPin className="w-4 h-4 text-[#8A6C37]" />
            </div>
            <span className="text-base font-semibold font-tajawal line-clamp-1 text-gray-700">{shop.address || shop.area || shop.city || 'الموقع غير محدد'}</span>
          </div>

          {/* Dynamic Rating Section */}
          <div className="flex items-center justify-between mb-5 p-3 bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] rounded-xl border border-[#E2D2B6]/50">
            <StarRating
              rating={shop.averageRating || shop.rating || 0}
              reviewCount={shop.reviewCount || 0}
              size="md"
              showText={true}
              showCount={true}
              className="flex-1"
              starClassName="drop-shadow-sm"
              textClassName="text-[#8A6C37] font-bold"
              countClassName="text-[#6D552C]"
            />
            {(shop.averageRating || shop.rating) > 4.5 && (
              <div className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white px-2 py-1 rounded-full text-xs font-bold">
                ⭐ ممتاز
              </div>
            )}
          </div>

          {/* Enhanced Action Section */}
          <div className="pt-6">
            <div className="flex flex-col gap-3">
              {/* Main Visit Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] hover:from-[#A66A00] hover:via-[#C37C00] hover:to-[#8A5700] text-white px-6 py-4 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 font-bold text-lg border border-[#D3BB92]/50"
                onClick={(e) => {
                  e.stopPropagation();
                  const shopId = shop._id || shop.id;
                  if (shopId) {
                    navigate(ROUTES.SHOP_DETAILS(shopId));
                  }
                }}
              >
                <span className="flex items-center justify-center gap-3 font-tajawal">
                  <Eye className="w-5 h-5" />
                  زيارة المتجر
                </span>
              </Button>

              {/* Secondary Actions */}
              <div className="flex gap-2">
                {/* Call Button */}
                <a
                  href={`tel:${shop.phone}`}
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full border-2 border-[#E2D2B6] hover:border-[#8A6C37] hover:bg-[#F8F4ED] text-gray-700 hover:text-[#8A6C37] py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </a>

                {/* Map Button */}
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(shop.location || shop.mapLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full border-2 border-[#E2D2B6] hover:border-[#6D552C] hover:bg-[#F0E8DB] text-gray-700 hover:text-[#6D552C] py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Map
                  </Button>
                </a>
              </div>
            </div>
          </div>

        </CardContent>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-[#E2D2B6] transition-all duration-500"></div>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-primary-1 to-primary-2 font-cairo"
      dir="ltr"
    >


      {/* Enhanced Hero Slider */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-primary-500/60 rounded-full animate-pulse z-20"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-white/40 rounded-full animate-bounce z-20"></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-primary-600/50 rounded-full animate-ping z-20"></div>

        {/* Slider Container */}
        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1500 ease-in-out ${index === currentSlide
                ? 'opacity-100 scale-100 z-20'
                : 'opacity-0 scale-110 z-10'
                }`}
            >
              {/* Background Image with Ken Burns Effect */}
              <div
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[15000ms] ${index === currentSlide ? 'scale-110' : 'scale-100'
                  }`}
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/70"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-20 h-full flex items-center justify-center">
                <div className="text-center text-white w-full px-4 sm:px-6 lg:px-8">
                  {/* Premium Badge with Animation */}

                  {/* Main Title with Stagger Animation */}
                  <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black font-cairo mb-8 leading-tight transition-all duration-1000 delay-200 ${index === currentSlide ? 'animate-fade-in translate-y-0' : 'translate-y-10 opacity-0'
                    }`}>
                    <span className={`bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent drop-`}>
                      {slide.title}
                    </span>
                  </h1>

                  {/* Subtitle with Animation */}
                  <h2 className={`text-xl md:text-2xl lg:text-3xl text-white/90 font-medium font-tajawal mb-6 w-full drop- transition-all duration-1000 delay-400 ${index === currentSlide ? 'animate-fade-in translate-y-0' : 'translate-y-10 opacity-0'
                    }`}>
                    {slide.subtitle}
                  </h2>

                  {/* Description with Animation */}
                  {/* <p className={`text-base md:text-lg lg:text-xl text-white/80 mb-12 w-full leading-relaxed drop- transition-all duration-1000 delay-600 ${index === currentSlide ? 'animate-fade-in translate-y-0' : 'translate-y-10 opacity-0'
                    }`}>
                    {slide.description}
                  </p> */}

                  {/* Action Buttons with Animation */}
                  {/* <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 delay-800 ${index === currentSlide ? 'animate-fade-in translate-y-0' : 'translate-y-10 opacity-0'
                    }`}>
                    <Button
                      size="lg"
                      onClick={() => navigate('/shops')}
                      className={`bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] hover:from-[#A66A00] hover:via-[#C37C00] hover:to-[#8A5700] text-white px-10 py-3 text-lg font-bold rounded-full transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 border-2 border-[#D3BB92]/50`}
                    >
                      <span className="flex items-center gap-3">
                        استكشف المتاجر
                        <span className="text-2xl">←</span>
                      </span>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/products')}
                      className="bg-white/15 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/25 hover:border-white/60 px-10 py-3 text-lg font-bold rounded-full transition-all duration-500 transform hover:scale-110"
                    >
                      <span className="flex items-center gap-3">
                        عرض المنتجات
                      </span>
                    </Button>
                  </div> */}
                </div>
              </div>
            </div>
          ))}

          {/* Enhanced Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-30">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-500 rounded-full border-2 ${index === currentSlide
                  ? 'w-16 h-4 bg-white border-white '
                  : 'w-4 h-4 bg-white/30 border-white/50 hover:bg-white/60 hover:scale-125 hover:border-white'
                  }`}
              />
            ))}
          </div>

          {/* Enhanced Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white/15 backdrop-blur-md rounded-full transition-all duration-500 flex items-center justify-center text-white hover:bg-white/25 z-30 border-2 border-white/30 hover:border-white/50 group"
          >
            <span className="text-3xl font-bold group-hover:scale-110 transition-transform duration-300">‹</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white/15 backdrop-blur-md rounded-full transition-all duration-500 flex items-center justify-center text-white hover:bg-white/25 z-30 border-2 border-white/30 hover:border-white/50 group"
          >
            <span className="text-3xl font-bold group-hover:scale-110 transition-transform duration-300">›</span>
          </button>

          {/* Enhanced Slide Counter */}
          <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur-md text-white px-6 py-3 rounded-full text-lg font-semibold z-30 border border-white/20">
            <span className="text-[#C5A56D]">{currentSlide + 1}</span>
            <span className="text-white/60 mx-2">/</span>
            <span className="text-white/80">{heroSlides.length}</span>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30">
            <div
              className="h-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Clean Search Section */}
      <section className="py-24 bg-gradient-to-br from-white to-[#F8F4ED]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-cairo text-gray-900 mb-6">
              اعثر على أحلامك
            </h2>
            <p className="text-lg md:text-xl text-gray-600 w-full text-center font-tajawal">
              اكتشف أجمل قطع المجوهرات والذهب من أفضل المتاجر في مصر
            </p>
          </div>

          {/* Simple Search Bar */}
          <div className="w-full mb-16">
            <div className="relative bg-gray-50 rounded-2xl p-2 border border-gray-200 hover:border-[#A37F41] transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="ابحث عن المجوهرات، الذهب، المتاجر..."
                    value={searchQuery}
                    onFocus={handleSearch}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-base rounded-xl border-0 focus:ring-2 focus:ring-[#C37C00]/30 bg-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  بحث
                </Button>
              </div>
            </div>
          </div>

          {/* Simple Categories */}
          <div className="w-full">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold font-cairo text-gray-800 mb-4">
                الفئات الشائعة
              </h3>
              <p className="text-base font-tajawal text-gray-600">وصول سريع إلى مجموعاتنا</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/shops?category=gold')}
                className="group bg-white border-2 border-secondary-2 hover:border-primary-500 text-primary-900 hover:text-primary-500 transition-all duration-300 p-6 h-auto rounded-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-1 to-primary-2 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">💍</span>
                  </div>
                  <div className="font-semibold font-cairo text-sm">خواتم ذهبية</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/shops?category=necklaces')}
                className="group bg-white border-2 border-gray-200 hover:border-[#8A6C37] text-gray-700 hover:text-[#8A6C37] transition-all duration-300 p-6 h-auto rounded-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#F0E8DB] to-[#D3BB92] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📿</span>
                  </div>
                  <div className="font-semibold font-tajawal text-sm">قلائد</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/shops?category=bracelets')}
                className="group bg-white border-2 border-gray-200 hover:border-[#C5A56D] text-gray-700 hover:text-[#C5A56D] transition-all duration-300 p-6 h-auto rounded-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E2D2B6] to-[#D3BB92] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">💎</span>
                  </div>
                  <div className="font-semibold font-tajawal text-sm">أساور</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/shops?category=earrings')}
                className="group bg-white border-2 border-gray-200 hover:border-[#92723A] text-gray-700 hover:text-[#92723A] transition-all duration-300 p-6 h-auto rounded-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#F0E8DB] to-[#E2D2B6] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div className="font-semibold font-tajawal text-sm">أقراط</div>
                </div>
              </Button>
            </div>
          </div>


        </div>
      </section>

      {/* Clean Featured Shops Section */}
      <section className="py-24 bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Simple Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#F0E8DB] text-[#8A6C37] text-sm font-medium mb-6">
              المتاجر المميزة
            </div>

            {/* Clean Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-cairo text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-[#C37C00] to-[#E6A500] bg-clip-text text-transparent">
                اكتشف أفضل
              </span>
              <br />
              <span className="text-gray-800">
                متاجر المجوهرات
              </span>
            </h2>

            {/* Simple Subtitle */}
            <p className="text-xl font-tajawal text-gray-600 w-full text-center leading-relaxed mb-12">
              مجموعة مختارة من أرقى متاجر المجوهرات التي تقدم أعلى جودة من الذهب والمعادن الثمينة
            </p>

            {/* Clean Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[#C37C00] mb-2">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    `${stats.totalShops}+`
                  )}
                </div>
                <div className="text-gray-600 font-medium font-tajawal">متجر</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[#C37C00] mb-2">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    `${stats.totalProducts.toLocaleString()}+`
                  )}
                </div>
                <div className="text-gray-600 font-medium font-tajawal">منتج</div>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-[#C37C00] mb-2">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    `${stats.averageRating.toFixed(1)}`
                  )}
                </div>
                <div className="text-gray-600 font-medium font-tajawal">تقييم</div>
              </div>
            </div>
          </div>

          {/* Premium Featured Shops Section - Only 4 Cards */}
          {isLoading ? (
            <div className="mb-16">
              {/* Premium Badge Skeleton */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-48 h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Premium Shops Grid Skeleton - Only 4 Cards */}
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="relative bg-white rounded-3xl overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Premium Badge Skeleton */}
                    <div className="absolute -top-3 left-3 z-20">
                      <div className="w-20 h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse"></div>
                    </div>
                    {/* Premium Crown Skeleton */}
                    <div className="absolute -top-2 right-3 z-20">
                      <div className="w-6 h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse"></div>
                    </div>
                    {/* Image Skeleton */}
                    <div className="relative border-4 border-gradient-to-r rounded-3xl p-1">
                      <div className="bg-white rounded-2xl overflow-hidden">
                        <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                        <div className="p-6">
                          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full mb-3 animate-pulse"></div>
                          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full mb-4 w-3/4 animate-pulse"></div>
                          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl w-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            featuredShops.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white px-6 py-2 rounded-full  ">
                    <div className="flex items-center gap-2 ">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold font-tajawal text-sm ">المتاجر المميزة المدفوعة</span>
                    </div>
                  </div>
                </div>

                {/* Premium Shops Grid - Only 4 Cards */}
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {featuredShops.slice(0, 4).map((shop, index) => (
                    <div key={shop._id || shop.id} className="relative opacity-0 animate-fade-in" style={{
                      animationDelay: `${index * 0.15}s`,
                      animationFillMode: 'forwards'
                    }}>
                      {/* Premium Badge */}
                      <div className="absolute -top-3 left-3 z-20">
                        <div className={`bg-gradient-to-r ${index === 0 ? 'from-yellow-400 to-yellow-600' :
                          index === 1 ? 'from-gray-300 to-gray-500' :
                            index === 2 ? 'from-amber-600 to-amber-800' :
                              'from-blue-400 to-blue-600'} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                          #{index + 1} مميز
                        </div>
                      </div>
                      {/* Premium Crown */}
                      <div className="absolute -top-2 right-3 z-20">
                        <div className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] p-1.5 rounded-full">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                          </svg>
                        </div>
                      </div>
                      {/* Premium Border with ShopCard */}
                      <div className="border-4 border-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-3xl p-1 bg-gradient-to-br from-[#C37C00] to-[#A66A00]">
                        <div className="bg-white rounded-2xl overflow-hidden">
                          <ShopCard shop={shop} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Enhanced View All Button */}
          <div className="text-center mt-20">
            <div className="relative inline-block">
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-full blur-lg opacity-30 animate-pulse"></div>

              <Button
                onClick={() => navigate('/shops')}
                className="relative bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] hover:from-[#A66A00] hover:via-[#C37C00] hover:to-[#8A5700] text-white px-12 py-4 text-xl font-bold rounded-full transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 border-2 border-[#D3BB92]/50"
              >
                <span className="flex items-center gap-3 font-tajawal">
                  <span>استكشف جميع المتاجر</span>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">←</span>
                  </div>
                </span>
              </Button>
            </div>

            {/* Subtitle */}
            <p className="text-secondary-800 font-cairo mt-4 text-lg">
              اكتشف أكثر من <span className="font-bold text-primary-500">{stats.totalShops || '50'}+</span> متجر مجوهرات معتمد
            </p>
          </div>


        </div>
      </section>

      {/* Clean Services Section */}
      <section className="py-24 bg-gradient-to-br from-white to-primary-1">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold font-cairo text-primary-900 mb-6">
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                لماذا تختارنا؟
              </span>
            </h2>
            <p className="text-xl font-cairo text-secondary-800 w-full text-center">
              نوفر لك تجربة تسوق استثنائية مع أفضل الخدمات والضمانات
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="text-center p-6 bg-primary-1 rounded-2xl hover:bg-white transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-cairo mb-4 text-primary-900">
                ضمان الجودة
              </h3>
              <p className="text-secondary-800 font-cairo leading-relaxed">
                جميع المنتجات معتمدة ومضمونة الجودة مع شهادات أصالة للذهب والمجوهرات
              </p>
            </div>

            {/* Service 2 */}
            <div className="text-center p-6 bg-[#F8F4ED] rounded-2xl hover:bg-white transition-all duration-300">
              <div className="w-20 h-20  bg-gradient-to-br from-[#A66A00] to-[#A66A00] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-cairo mb-4 text-gray-900">
                متاجر موثوقة
              </h3>
              <p className="text-gray-600 font-tajawal leading-relaxed">
                جميع المتاجر مفحوصة ومعتمدة من خبراء المجوهرات لضمان أفضل تجربة تسوق
              </p>
            </div>

            {/* Service 3 */}
            <div className="text-center p-6 bg-[#F8F4ED] rounded-2xl hover:bg-white transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-[#A66A00] to-[#A66A00] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-white " />
              </div>
              <h3 className="text-2xl font-bold font-cairo mb-4 text-gray-900">
                أفضل الأسعار
              </h3>
              <p className="text-gray-600 font-tajawal leading-relaxed">
                أفضل الأسعار في السوق مع عروض وخصومات حصرية لعملائنا الكرام
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-gradient-to-br from-[#Fdfcf9] to-[#f8f1e4] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/gold-pattern.svg')] opacity-5 bg-center bg-cover pointer-events-none" />

        <div className="relative w-full text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold font-cairo mb-6 bg-gradient-to-r from-[#C37C00] to-[#A66A00] bg-clip-text text-transparent">
            هل أنت مستعد لاكتشاف مجوهراتك المثالية؟
          </h2>

          <p className="text-xl font-tajawal text-[#5C4A1C] mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف العملاء الراضين الذين وجدوا مجوهرات أحلامهم من خلال ديبلا
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/shops')}
              className="bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] hover:from-[#A66A00] hover:via-[#C37C00] hover:to-[#8A5700] text-white px-12 py-4 text-xl font-bold rounded-full transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 border-2 border-[#D3BB92]/50"
            >
              استكشف المتاجر الآن
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/register')}
              className="bg-transparent border-2 border-[#7A5200] text-[#7A5200] hover:bg-[#7A5200] hover:text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              انضم إلينا الآن
            </Button>
          </div>

          <div className="mt-10 text-[#5C4A1C]">
            <p className="text-lg font-medium font-tajawal">
              أكثر من {stats.totalReviews || '1000'} عميل راضٍ يثق بنا
            </p>
          </div>
        </div>
      </section>

      {/* Floating Chat Component */}
      <FloatingChat />

      <ConversationsFloatinButton user={user} onSelectConversation={(productId) => {
        navigate(ROUTES.PRODUCT_DETAILS(productId))
      }} />
    </motion.div >
  );
};

export default Home;




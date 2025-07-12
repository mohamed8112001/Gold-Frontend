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
  Shield,
  Award
} from 'lucide-react';
import { ROUTES } from '../utils/constants.js';
import { shopService } from '../services/shopService.js';
import FloatingChat from '../components/ui/FloatingChat.jsx';
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

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

  // Hero slides with beautiful jewelry images
  const heroSlides = [
    {
      id: 1,
      title: 'Luxury Jewelry',
      subtitle: 'Discover the finest gold and jewelry pieces',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 2,
      title: 'Wedding Rings',
      subtitle: 'Unforgettable moments with the most beautiful rings',
      image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-rose-400 to-pink-600'
    },
    {
      id: 3,
      title: 'Precious Stones',
      subtitle: 'Jewelry adorned with natural gemstones',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-purple-400 to-indigo-600'
    },
    {
      id: 4,
      title: '21K Gold',
      subtitle: 'High quality with authenticity guarantee',
      image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-amber-400 to-orange-600'
    },
    {
      id: 5,
      title: 'Diamond Collection',
      subtitle: 'Sparkling diamonds for special moments',
      image: 'https://images.unsplash.com/photo-1544376664-80b17f09d399?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-blue-400 to-cyan-600'
    },
    {
      id: 6,
      title: 'Pearl Elegance',
      subtitle: 'Timeless beauty of natural pearls',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      gradient: 'from-gray-400 to-gray-600'
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
    console.log('hello');

    navigate(`${ROUTES.SHOPS}?search=${encodeURIComponent(searchQuery)}`);
    // if (searchQuery.trim()) {
    // }
  };


  const ShopCard = ({ shop }) => (
    <Card className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border-0">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 via-transparent to-yellow-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Image Section */}
      <div className="relative overflow-hidden rounded-t-3xl">
        <img
          src={shop.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
          alt={shop.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Gradient Overlay on Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

        {/* Favorite Button */}
        <div className="absolute top-4 right-4">
          <Button
            size="sm"
            variant="ghost"
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg border-0 p-0"
          >
            <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-300" />
          </Button>
        </div>

        {/* Verified Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
            <span className="font-semibold">✓ Verified</span>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-bold text-gray-800">{shop.rating}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6 relative z-10">
        {/* Store Name */}
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-1 group-hover:text-yellow-600 transition-colors duration-300">
          {shop.name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-4">
          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            <MapPin className="w-3 h-3" />
          </div>
          <span className="text-sm font-medium line-clamp-1">{shop.area}</span>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-6">
          {shop.specialties?.slice(0, 2).map((specialty, index) => (
            <span
              key={index}
              className="text-xs bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 px-3 py-1.5 rounded-full font-medium border border-yellow-200"
            >
              {specialty}
            </span>
          ))}
          {shop.specialties?.length > 2 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
              +{shop.specialties.length - 2} more
            </span>
          )}
        </div>

        {/* Action Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id))}
          >
            <span className="flex items-center gap-2">
              View Store
              <Eye className="w-4 h-4" />
            </span>
          </Button>

          <div className="text-right">
            <div className="text-sm font-semibold text-gray-800">{shop.reviews}</div>
            <div className="text-xs text-gray-500">reviews</div>
          </div>
        </div>
      </CardContent>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-yellow-200 transition-all duration-500"></div>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
      dir="ltr"
    >
      {/* Enhanced Hero Slider */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-yellow-400/60 rounded-full animate-pulse z-20"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-white/40 rounded-full animate-bounce z-20"></div>
        <div className="absolute bottom-32 left-32 w-3 h-3 bg-yellow-300/50 rounded-full animate-ping z-20"></div>

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
                <div className="text-center text-white max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Premium Badge with Animation */}
                  <div className={`inline-flex items-center px-8 py-4 rounded-full bg-white/15 backdrop-blur-md border border-white/30 shadow-2xl mb-8 transition-all duration-700 ${index === currentSlide ? 'animate-fade-in scale-100' : 'scale-95 opacity-0'
                    }`}>
                    <span className="text-white font-semibold text-lg tracking-wide">✨ Premium Collection ✨</span>
                  </div>

                  {/* Main Title with Stagger Animation */}
                  <h1 className={`text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight transition-all duration-1000 delay-200 ${index === currentSlide ? 'animate-fade-in translate-y-0' : 'translate-y-10 opacity-0'
                    }`}>
                    <span className={`bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent drop-shadow-2xl`}>
                      {slide.title}
                    </span>
                  </h1>

                  {/* Subtitle with Animation */}
                  <h2 className={`text-2xl md:text-4xl lg:text-5xl text-white/90 font-light mb-6 max-w-4xl mx-auto drop-shadow-lg transition-all duration-1000 delay-400 ${index === currentSlide ? 'animate-fade-in translate-y-0' : 'translate-y-10 opacity-0'
                    }`}>
                    {slide.subtitle}
                  </h2>

                  {/* Description with Animation */}
                  <p className={`text-lg md:text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md transition-all duration-1000 delay-600 ${index === currentSlide ? 'animate-fade-in translate-y-0' : 'translate-y-10 opacity-0'
                    }`}>
                    {slide.description}
                  </p>

                  {/* Action Buttons with Animation */}
                  <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 delay-800 ${index === currentSlide ? 'animate-fade-in translate-y-0' : 'translate-y-10 opacity-0'
                    }`}>
                    <Button
                      size="lg"
                      onClick={() => navigate('/shops')}
                      className={`bg-gradient-to-r ${slide.gradient} hover:scale-110 text-white px-12 py-5 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 transform border-2 border-white/30 hover:border-white/50 backdrop-blur-sm`}
                    >
                      <span className="flex items-center gap-3">
                        Explore Stores
                        <span className="text-2xl">→</span>
                      </span>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/products')}
                      className="bg-white/15 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/25 hover:border-white/60 px-12 py-5 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110"
                    >
                      <span className="flex items-center gap-3">
                        View Products
                        <span className="text-2xl">✨</span>



                      </span>
                    </Button>
                  </div>
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
                  ? 'w-16 h-4 bg-white border-white shadow-2xl'
                  : 'w-4 h-4 bg-white/30 border-white/50 hover:bg-white/60 hover:scale-125 hover:border-white'
                  }`}
              />
            ))}
          </div>

          {/* Enhanced Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white/15 backdrop-blur-md rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center text-white hover:bg-white/25 z-30 border-2 border-white/30 hover:border-white/50 group"
          >
            <span className="text-3xl font-bold group-hover:scale-110 transition-transform duration-300">‹</span>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-white/15 backdrop-blur-md rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center text-white hover:bg-white/25 z-30 border-2 border-white/30 hover:border-white/50 group"
          >
            <span className="text-3xl font-bold group-hover:scale-110 transition-transform duration-300">›</span>
          </button>

          {/* Enhanced Slide Counter */}
          <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur-md text-white px-6 py-3 rounded-full text-lg font-semibold z-30 border border-white/20 shadow-xl">
            <span className="text-yellow-400">{currentSlide + 1}</span>
            <span className="text-white/60 mx-2">/</span>
            <span className="text-white/80">{heroSlides.length}</span>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Clean Search Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Dreams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the most beautiful jewelry and gold pieces from the best stores in Egypt
            </p>
          </div>

          {/* Simple Search Bar */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative bg-gray-50 rounded-2xl p-2 shadow-lg border border-gray-200 hover:border-yellow-300 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search for jewelry, gold, stores..."
                    value={searchQuery}
                    onFocus={handleSearch}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-0 focus:ring-2 focus:ring-yellow-300 bg-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Simple Categories */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Popular Categories
              </h3>
              <p className="text-gray-600">Quick access to our collections</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/shops?category=gold')}
                className="group bg-white border-2 border-gray-200 hover:border-yellow-400 text-gray-700 hover:text-yellow-600 transition-all duration-300 p-6 h-auto rounded-2xl shadow-md hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">💍</span>
                  </div>
                  <div className="font-semibold">Gold Rings</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/shops?category=necklaces')}
                className="group bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 transition-all duration-300 p-6 h-auto rounded-2xl shadow-md hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📿</span>
                  </div>
                  <div className="font-semibold">Necklaces</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/shops?category=bracelets')}
                className="group bg-white border-2 border-gray-200 hover:border-purple-400 text-gray-700 hover:text-purple-600 transition-all duration-300 p-6 h-auto rounded-2xl shadow-md hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">💎</span>
                  </div>
                  <div className="font-semibold">Bracelets</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/shops?category=earrings')}
                className="group bg-white border-2 border-gray-200 hover:border-pink-400 text-gray-700 hover:text-pink-600 transition-all duration-300 p-6 h-auto rounded-2xl shadow-md hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div className="font-semibold">Earrings</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Clean Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
            <Button
              onClick={() => navigate('/shops')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Browse All Stores
            </Button>
            <Button
              onClick={() => navigate('/products')}
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg rounded-full transition-all duration-300 transform hover:scale-105"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* Clean Featured Shops Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            {/* Simple Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-6">
              Featured Stores
            </div>

            {/* Clean Title */}
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                Discover the Best
              </span>
              <br />
              <span className="text-gray-800">
                Jewelry Stores
              </span>
            </h2>

            {/* Simple Subtitle */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              A curated collection of the finest jewelry stores offering the highest quality gold and precious metals
            </p>

            {/* Clean Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    `${stats.totalShops}+`
                  )}
                </div>
                <div className="text-gray-600 font-medium">Stores</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    `${stats.totalProducts.toLocaleString()}+`
                  )}
                </div>
                <div className="text-gray-600 font-medium">Products</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-12 rounded mx-auto"></div>
                  ) : (
                    `${stats.averageRating.toFixed(1)}`
                  )}
                </div>
                <div className="text-gray-600 font-medium">Rating</div>
              </div>
            </div>
          </div>

          {/* Enhanced Shops Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image Skeleton */}
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredShops.slice(0, 6).map((shop, index) => (
                <div
                  key={shop._id || shop.id}
                  className="opacity-0 animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.15}s`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <ShopCard shop={shop} />
                </div>
              ))}
            </div>
          )}

          {/* Enhanced View All Button */}
          <div className="text-center mt-20">
            <div className="relative inline-block">
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-lg opacity-30 animate-pulse"></div>

              <Button
                onClick={() => navigate('/shops')}
                className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-800 text-white px-12 py-4 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 border-2 border-yellow-400/50"
              >
                <span className="flex items-center gap-3">
                  <span>Explore All Stores</span>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">→</span>
                  </div>
                </span>
              </Button>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 mt-4 text-lg">
              Discover over <span className="font-bold text-yellow-600">{stats.totalShops || '50'}+</span> verified jewelry stores
            </p>
          </div>


        </div>
      </section>

      {/* Clean Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                Why Choose Us?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide you with an exceptional shopping experience with the best services and guarantees
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Quality Guarantee
              </h3>
              <p className="text-gray-600 leading-relaxed">
                All products are certified and quality guaranteed with authenticity certificates for gold and jewelry
              </p>
            </div>

            {/* Service 2 */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Trusted Stores
              </h3>
              <p className="text-gray-600 leading-relaxed">
                All stores are inspected and certified by jewelry experts to ensure the best shopping experience
              </p>
            </div>

            {/* Service 3 */}
            <div className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Best Prices
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Best prices in the market with exclusive offers and discounts for our valued customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clean CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-yellow-600">

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Discover Your Perfect Jewelry?
          </h2>
          <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream jewelry through Dibla
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/shops')}
              className="bg-white text-yellow-600 hover:bg-yellow-50 px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Explore Stores Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/register')}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-yellow-600 px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Join Us Now
            </Button>
          </div>

          <div className="mt-8 text-yellow-100">
            <p className="text-lg">
              More than <span className="font-bold text-white">{stats.totalReviews || '1000'}</span> satisfied customers trust us
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

                Demo Login (Quick Access)
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

      {/* Floating Chat Component */}
      <FloatingChat />

    </motion.div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.jsx';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isShopOwner, logout, isRegularUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Enhanced scroll detection effect
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Show header when at top of page (more sensitive)
      if (currentScrollY < 5) {
        setIsVisible(true);
      }
      // Hide header when scrolling down (faster response)
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      }
      // Show header when scrolling up (immediate response)
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          controlHeader();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };



  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 bg-gradient-to-br from-white/98 via-[#FFF8E6]/95 via-[#FFFBF0]/90 to-white/98 backdrop-blur-3xl shadow-2xl border-b-2 border-gradient-to-r from-[#C37C00]/30 via-[#E6A500]/40 to-[#C37C00]/30 z-50 transition-all duration-700 ${isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        dir="rtl"
      >
        {/* Enhanced Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8E6]/40 via-[#FFFBF0]/60 to-[#FFF8E6]/40 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#F4D03F]/10 to-transparent"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-2 left-10 w-1 h-1 bg-[#C37C00]/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-4 right-20 w-1.5 h-1.5 bg-[#E6A500]/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-3 left-1/3 w-1 h-1 bg-[#A66A00]/40 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-5 right-1/4 w-0.5 h-0.5 bg-[#C37C00]/70 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1 right-1/3 w-1 h-1 bg-[#F4D03F]/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Enhanced Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C37C00] via-[#E6A500] via-[#F4D03F] to-[#A66A00]">
          <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        </div>

        {/* Enhanced Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] opacity-80">
          <div className="h-full bg-gradient-to-r from-transparent via-[#F4D03F]/50 to-transparent animate-pulse"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="flex justify-between items-center h-20 min-w-0">
            {/* Enhanced Logo */}
            <Link to="/" className="flex items-center group relative">
              <div className="flex items-center space-x-reverse space-x-4">
                <div className="relative">
                  {/* Enhanced Logo Container */}
                  <div className="relative w-14 h-14 group-hover:scale-110 transition-all duration-500">
                    {/* Rotating Border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-spin-slow"></div>

                    {/* Logo Image */}
                    <img
                      src="/logo.webp"
                      alt="متجر الذهب"
                      className="relative w-12 h-12 m-1 rounded-xl shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:rotate-6 object-cover z-10"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />

                    {/* Fallback Logo */}
                    <div className="absolute inset-1 bg-gradient-to-br from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-xl shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:rotate-6 hidden items-center justify-center">
                      <div className="text-white text-xl font-bold">💍</div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                    </div>

                    {/* Floating Sparkles */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#F4D03F] rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-300"></div>
                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#E6A500] rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  {/* Main Title with Enhanced Effects */}
                  <span className="text-3xl font-black font-cairo bg-gradient-to-r from-[#C37C00] via-[#E6A500] via-[#F4D03F] to-[#A66A00] bg-clip-text text-transparent tracking-wide group-hover:tracking-wider transition-all duration-500 group-hover:scale-105 transform-gpu">
                    متجر الذهب
                  </span>

                  {/* Subtitle with Animation */}
                  <span className="text-xs text-[#8A5700] font-bold font-amiri tracking-widest group-hover:text-[#C37C00] transition-all duration-500 group-hover:scale-110 transform origin-right">
                    <span className="inline-block group-hover:animate-bounce">✨</span>
                    <span className="mx-1">ذهب فاخر</span>
                    <span className="inline-block group-hover:animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                  </span>
                </div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-[#C37C00]/0 via-[#C37C00]/5 to-[#C37C00]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </Link>

            {/* Enhanced Interactive Navigation */}
            <nav className="hidden lg:flex items-center space-x-reverse space-x-2" dir="rtl">
              <Link
                to="/home"
                className="relative text-[#8A5700] hover:text-white font-bold font-tajawal text-lg transition-all duration-500 group px-6 py-3 rounded-2xl overflow-hidden"
              >
                <span className="relative z-10 transition-all duration-300 group-hover:scale-105">الرئيسية</span>
                {/* Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-right"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8E6]/50 to-[#FFF0CC]/50 opacity-100 group-hover:opacity-0 transition-opacity duration-300 rounded-2xl"></div>
                {/* Sparkle Effect */}
                <div className="absolute top-1 right-1 w-1 h-1 bg-[#F4D03F] rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-300"></div>
              </Link>

              <Link
                to="/shops"
                className="relative text-[#8A5700] hover:text-white font-bold font-tajawal text-lg transition-all duration-500 group px-6 py-3 rounded-2xl overflow-hidden"
              >
                <span className="relative z-10 transition-all duration-300 group-hover:scale-105">المتاجر</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-right"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8E6]/50 to-[#FFF0CC]/50 opacity-100 group-hover:opacity-0 transition-opacity duration-300 rounded-2xl"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-[#F4D03F] rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-300"></div>
              </Link>

              <Link
                to="/products"
                className="relative text-[#8A5700] hover:text-white font-bold font-tajawal text-lg transition-all duration-500 group px-6 py-3 rounded-2xl overflow-hidden"
              >
                <span className="relative z-10 transition-all duration-300 group-hover:scale-105">المنتجات</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-right"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8E6]/50 to-[#FFF0CC]/50 opacity-100 group-hover:opacity-0 transition-opacity duration-300 rounded-2xl"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-[#F4D03F] rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-300"></div>
              </Link>

              {(isAuthenticated && user && (isShopOwner)) && (
                <Link
                  to="/dashboard"
                  className="relative text-[#8A5700] hover:text-[#C37C00] font-medium text-lg transition-all duration-300 group px-3 py-2"
                >
                  <span className="relative z-10">لوحة التحكم</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C37C00] to-[#A66A00] group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
              {(isAuthenticated && user && (isRegularUser)) && (
                <Link
                  to="/favorites"
                  className="relative text-[#8A5700] hover:text-[#C37C00] font-medium text-lg transition-all duration-300 group px-3 py-2"
                >
                  <span className="relative z-10">المفضلة</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C37C00] to-[#A66A00] group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="relative text-[#8A5700] hover:text-red-600 font-medium text-lg transition-all duration-300 group px-3 py-2"
                >
                  <span className="relative z-10">الإدارة</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
            </nav>

            {/* Clean Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-reverse space-x-4 flex-shrink-0">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-gradient-to-r from-white/95 via-[#FFF8E6]/80 to-white/95 px-3 py-2 rounded-xl border-2 border-[#C37C00]/40 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:border-[#C37C00]/70 hover:scale-[1.02] group backdrop-blur-sm max-w-[200px]"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 ring-1 ring-white/60 group-hover:ring-[#C37C00]/40">
                          <span className="text-white font-bold text-sm">
                            {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white shadow-sm"></div>
                      </div>
                      <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden">
                        <span className="text-[#8A5700] font-bold text-sm leading-tight truncate" title={user?.firstName || user?.email?.split('@')[0] || 'مستخدم'}>
                          {user?.firstName || user?.email?.split('@')[0] || 'مستخدم'}
                        </span>
                        <span className="text-[#C37C00] text-xs font-medium truncate">
                          {user?.role === 'admin' ? '👑 مدير' :
                            user?.role === 'seller' ? '🏪 صاحب متجر' : user?.role === 'customer' ? '👤 عضو ' : ""}
                        </span>
                      </div>
                      <ChevronDown className="w-3 h-3 text-[#8A5700] group-hover:text-[#C37C00] transition-all duration-300 group-hover:rotate-180 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 bg-gradient-to-br from-white via-[#FFF8E6]/40 to-white border-2 border-[#C37C00]/30 shadow-xl rounded-2xl p-3 mt-2 backdrop-blur-sm">
                    <div className="px-4 py-4 border-b border-[#C37C00]/20 mb-3 bg-gradient-to-r from-[#FFF8E6]/30 to-[#FFF0CC]/30 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/50">
                            <span className="text-white font-bold text-xl">
                              {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <p className="font-bold text-[#8A5700] text-lg leading-tight truncate" title={user?.firstName || user?.email?.split('@')[0] || 'مستخدم'}>
                              مرحباً، {user?.firstName || user?.email?.split('@')[0] || 'مستخدم'}
                            </p>
                          </div>
                          <div className="mb-2">
                            <p className="text-[#C37C00]/80 text-sm truncate" title={user?.email || 'لا يوجد بريد إلكتروني'}>
                              {user?.email || 'لا يوجد بريد إلكتروني'}
                            </p>
                          </div>
                          <div>
                            <span className="inline-flex items-center text-xs font-semibold bg-gradient-to-r from-[#C37C00]/10 to-[#E6A500]/10 text-[#8A5700] px-3 py-1 rounded-full border border-[#C37C00]/20">
                              {user?.role === 'admin' ? '👑 مدير النظام' :
                                user?.role === 'seller' ? '🏪 صاحب متجر' : user?.role === 'customer' ? '👤 عضو ' : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] cursor-pointer rounded-xl transition-all duration-300 group mx-1 mb-2"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C37C00]/10 to-[#E6A500]/10 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#C37C00]/20 group-hover:to-[#E6A500]/20 transition-all duration-300 border border-[#C37C00]/10 group-hover:border-[#C37C00]/30">
                          <User className="w-5 h-5 text-[#8A5700] group-hover:text-[#C37C00] transition-colors duration-300" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[#8A5700] font-bold text-base group-hover:text-[#C37C00] transition-colors duration-300">الملف الشخصي</span>
                          <span className="text-[#C37C00]/60 text-xs">عرض وتعديل البيانات الشخصية</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 cursor-pointer rounded-xl transition-all duration-300 text-red-600 hover:text-red-700 group mx-1 border border-red-100 hover:border-red-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-red-100 group-hover:to-red-200 transition-all duration-300 border border-red-200 group-hover:border-red-300">
                        <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-base transition-colors duration-300">تسجيل الخروج</span>
                        <span className="text-red-500/70 text-xs">إنهاء الجلسة الحالية</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-reverse space-x-4">
                  {/* Enhanced Login Button */}
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="relative border-2 border-[#C37C00]/50 text-[#8A5700] hover:text-white font-bold font-tajawal px-8 py-3 rounded-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-2xl overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">🔑</span>
                      تسجيل الدخول
                    </span>
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100 origin-center"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                    {/* Sparkle Effects */}
                    <div className="absolute top-1 right-2 w-1 h-1 bg-[#F4D03F] rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-300"></div>
                    <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-[#E6A500] rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500"></div>
                  </Button>

                  {/* Enhanced Register Button */}
                  <Button
                    onClick={() => navigate('/register')}
                    className="relative bg-gradient-to-r from-[#C37C00] via-[#E6A500] via-[#F4D03F] to-[#A66A00] hover:from-[#E6A500] hover:via-[#F4D03F] hover:to-[#C37C00] text-white font-bold font-tajawal px-8 py-3 rounded-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-1 shadow-xl hover:shadow-2xl overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg group-hover:animate-spin">✨</span>
                      إنشاء حساب
                      <span className="text-lg group-hover:animate-bounce">🎯</span>
                    </span>
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 -skew-x-12 group-hover:translate-x-full"></div>
                    {/* Floating Particles */}
                    <div className="absolute top-0 left-1/4 w-1 h-1 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-all duration-300"></div>
                    <div className="absolute bottom-0 right-1/3 w-0.5 h-0.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-all duration-500"></div>
                  </Button>
                </div>
              )}
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#C37C00] hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] p-3 rounded-2xl transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-6 border-t-2 border-gradient-to-r from-[#C37C00]/30 via-[#E6A500]/40 to-[#C37C00]/30 bg-gradient-to-b from-[#FFF8E6]/50 to-white backdrop-blur-sm">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/home"
                  className="text-[#8A5700] hover:text-white font-bold text-lg px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#C37C00] hover:to-[#A66A00] hover:shadow-lg hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🏠 الرئيسية
                </Link>

                <Link
                  to="/shops"
                  className="text-[#8A5700] hover:text-white font-bold text-lg px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#C37C00] hover:to-[#A66A00] hover:shadow-lg hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🏪 المتاجر
                </Link>


                {(isAuthenticated && user) ? (
                  <>
                    <div className="flex items-center gap-4 py-5 px-6 bg-gradient-to-r from-[#FFF8E6]/80 via-[#FFFBF0] to-[#FFF0CC]/80 rounded-2xl border-2 border-[#C37C00]/30 mb-6 shadow-xl backdrop-blur-sm">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/60">
                          <span className="text-white font-bold text-2xl">
                            {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-md animate-pulse"></div>
                      </div>
                      <div className="flex flex-col justify-center flex-1 min-w-0 space-y-1">
                        <div>
                          <span className="text-[#8A5700] font-bold text-xl leading-tight truncate block" title={user?.firstName || user?.email?.split('@')[0] || 'مستخدم'}>
                            مرحباً، {user?.firstName || user?.email?.split('@')[0] || 'مستخدم'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#C37C00]/80 text-sm truncate block" title={user?.email || 'لا يوجد بريد إلكتروني'}>
                            {user?.email || 'لا يوجد بريد إلكتروني'}
                          </span>
                        </div>
                        <div>
                          <span className="inline-flex items-center text-xs font-bold bg-gradient-to-r from-[#C37C00]/20 to-[#E6A500]/20 text-[#8A5700] px-3 py-1.5 rounded-full border border-[#C37C00]/30 shadow-sm">
                            {user?.role === 'admin' ? '👑 مدير النظام' :
                              user?.role === 'shop_owner' ? '🏪 صاحب متجر' : '👤 عضو مميز'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {(isAdmin || isShopOwner) && (
                      <Link
                        to="/dashboard"
                        className="text-[#8A5700] hover:text-white font-bold text-lg px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#C37C00] hover:to-[#A66A00] hover:shadow-lg hover:scale-105"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        📊 لوحة التحكم
                      </Link>
                    )}
                    {isAuthenticated && isRegularUser && (
                      <Link
                        to="/favorites"
                        className="text-[#8A5700] hover:text-white font-bold text-lg px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#C37C00] hover:to-[#A66A00] hover:shadow-lg hover:scale-105"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        ❤️ المفضلة
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-red-600 hover:text-white font-bold text-lg px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 hover:shadow-lg hover:scale-105"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        ⚙️ لوحة الإدارة
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="text-[#8A5700] hover:text-white font-bold text-lg px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#C37C00] hover:to-[#A66A00] hover:shadow-lg hover:scale-105"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      👤 الملف الشخصي
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-center border-2 border-red-300 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 font-bold text-lg py-3 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 mt-4"
                    >
                      🚪 تسجيل الخروج
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full border-2 border-[#C37C00]/40 text-[#8A5700] hover:text-white hover:bg-gradient-to-r hover:from-[#C37C00] hover:to-[#A66A00] font-bold text-lg py-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC]"
                    >
                      🔑 تسجيل الدخول
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] hover:from-[#E6A500] hover:via-[#C37C00] hover:to-[#8A5700] text-white font-bold text-lg py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden group"
                    >
                      <span className="relative z-10">✨ إنشاء حساب</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
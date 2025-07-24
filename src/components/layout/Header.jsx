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
        className={`fixed top-0 left-0 right-0 w-full bg-white border-b border-secondary-2 shadow-sm z-50 font-cairo ${isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        dir="rtl"
      >
        <div className="relative w-full px-8 sm:px-12 lg:px-16 xl:px-20 overflow-hidden">
          <div className="flex justify-between items-center h-24 min-w-0 py-4">
            {/* Enhanced Logo */}
            <Link to="/" className="flex items-center group relative mr-8">
              <div className="flex items-center space-x-reverse space-x-6">
                <div className="relative">
                  {/* Enhanced Logo Container */}
                  <div className="relative w-16 h-16">
                    {/* Logo Image */}
                    <img
                      src="/logo.webp"
                      alt="متجر الذهب"
                      className="relative w-14 h-14 m-1 rounded-xl object-cover z-10"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />

                    {/* Fallback Logo */}
                    <div className="absolute inset-1 bg-gradient-to-br from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-xl hidden items-center justify-center">
                      <div className="text-white text-xl font-bold">💍</div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                    </div>

                  </div>
                </div>
                <div className="flex flex-col ml-6">
                  {/* Main Title with Enhanced Effects */}
                  <span className="text-3xl font-black font-cairo bg-gradient-to-r from-[#C37C00] via-[#E6A500] via-[#F4D03F] to-[#A66A00] bg-clip-text text-transparent tracking-wide">
                    متجر الذهب
                  </span>

                  {/* Subtitle */}
                  <span className="text-xs text-[#8A5700] font-bold font-amiri tracking-widest mt-1">
                    <span className="inline-block"></span>
                    <span className="mx-1">ذهب فاخر</span>
                    <span className="inline-block"></span>
                  </span>
                </div>
              </div>
            </Link>

            {/* Enhanced Interactive Navigation */}
            <nav className="hidden lg:flex items-center space-x-reverse space-x-4" dir="rtl">
              <Link
                to="/home"
                className="relative text-primary-900 hover:text-[#C37C00] font-bold font-cairo text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">الرئيسية</span>
              </Link>

              <Link
                to="/shops"
                className="relative text-primary-900 hover:text-[#C37C00] font-bold font-cairo text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">المتاجر</span>
              </Link>

              <Link
                to="/products"
                className="relative text-primary-900 hover:text-[#C37C00] font-bold font-cairo text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10">المنتجات</span>
              </Link>

              {(isAuthenticated && user && (isShopOwner)) && (
                <Link
                  to="/dashboard"
                  className="relative text-primary-900 hover:text-[#C37C00] font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">لوحة التحكم</span>
                </Link>
              )}
              {(isAuthenticated && user && (isRegularUser)) && (
                <Link
                  to="/favorites"
                  className="relative text-primary-900 hover:text-[#C37C00] font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">المفضلة</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="relative text-primary-900 hover:text-red-600 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">الإدارة</span>
                </Link>
              )}
            </nav>

            {/* Clean Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-reverse space-x-6 flex-shrink-0 ml-8">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
  <Button
    variant="outline"
    className="flex items-center gap-3 bg-white px-4 py-10 rounded-xl border-2 border-[#C37C00]/40 hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:border-[#C37C00]/70 group backdrop-blur-sm w-full"
  >
    <div className="relative flex-shrink-0">
      <div className="w-10 h-10 bg-gradient-to-br from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-lg flex items-center justify-center ring-1 ring-white/60">
        <span className="text-white font-bold text-sm">
          {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </span>
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
    </div>
    <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden">
      <span className="text-[#8A5700] font-bold text-sm leading-tight truncate" title={user?.firstName || user?.email?.split('@')[0] || 'مستخدم'}>
        {user?.firstName || user?.email?.split('@')[0] || 'مستخدم'}
      </span>
      <span className="text-[#C37C00] text-xs font-medium truncate mt-1">
        {user?.role === 'admin' ? '👑 مدير' :
          user?.role === 'seller' ? '🏪 صاحب متجر' : user?.role === 'customer' ? '👤 عضو ' : ""}
      </span>
    </div>
    <ChevronDown className="w-4 h-4 text-[#8A5700] group-hover:text-[#C37C00] flex-shrink-0" />
  </Button>
</DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-80 bg-white border-2 border-[#C37C00]/30 rounded-2xl p-4 mt-2 backdrop-blur-sm">
                    <div className="px-6 py-6 border-b border-[#C37C00]/20 mb-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-xl flex items-center justify-center ring-2 ring-white/50">
                            <span className="text-white font-bold text-xl">
                              {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
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
                        className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-xl transition-all duration-300 group mx-1 mb-2"
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
                <div className="flex items-center space-x-reverse space-x-6">
                  {/* Enhanced Login Button */}
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="relative border-2 border-[#C37C00]/50 bg-white text-[#8A5700] hover:text-white hover:bg-gradient-to-r hover:from-[#C37C00] hover:to-[#E6A500] font-bold font-tajawal px-10 py-4 rounded-2xl transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <span className="text-lg">🔑</span>
                      تسجيل الدخول
                    </span>
                  </Button>

                  {/* Enhanced Register Button */}
                  <Button
                    onClick={() => navigate('/register')}
                    className="relative bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] hover:from-[#E6A500] hover:to-[#C37C00] text-white font-bold font-tajawal px-10 py-4 rounded-2xl"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <span className="text-lg">✨</span>
                      إنشاء حساب
                      <span className="text-lg">🎯</span>
                    </span>
                  </Button>
                </div>
              )}
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="lg:hidden ml-4">
              <Button
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#C37C00] hover:bg-gray-100 p-4 rounded-2xl transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </Button>
            </div>
          </div>

          {/* Enhanced Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-8 border-t border-gray-200 bg-white">
              <div className="flex flex-col space-y-4 px-4">
                <Link
                  to="/home"
                  className="text-[#8A5700] hover:text-[#C37C00] font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🏠 الرئيسية
                </Link>

                <Link
                  to="/shops"
                  className="text-[#8A5700] hover:text-[#C37C00] font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🏪 المتاجر
                </Link>

                <Link
                  to="/products"
                  className="text-[#8A5700] hover:text-[#C37C00] font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  💎 المنتجات
                </Link>

                {(isAuthenticated && user) ? (
                  <>
                    <div className="flex items-center gap-4 py-6 px-8 bg-white rounded-2xl border-2 border-[#C37C00]/30 mb-6 backdrop-blur-sm">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#C37C00] via-[#E6A500] to-[#A66A00] rounded-2xl flex items-center justify-center ring-2 ring-white/60">
                          <span className="text-white font-bold text-2xl">
                            {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
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
                          <span className="inline-flex items-center text-xs font-bold bg-gradient-to-r from-[#C37C00]/20 to-[#E6A500]/20 text-[#8A5700] px-3 py-1.5 rounded-full border border-[#C37C00]/30">
                            {user?.role === 'admin' ? '👑 مدير النظام' :
                              user?.role === 'shop_owner' ? '🏪 صاحب متجر' : '👤 عضو مميز'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {(isAdmin || isShopOwner) && (
                      <Link
                        to="/dashboard"
                        className="text-[#8A5700] hover:text-[#C37C00] font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        📊 لوحة التحكم
                      </Link>
                    )}
                    {isAuthenticated && isRegularUser && (
                      <Link
                        to="/favorites"
                        className="text-[#8A5700] hover:text-[#C37C00] font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        ❤️ المفضلة
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-red-600 hover:text-red-700 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:shadow-lg hover:scale-105 transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        ⚙️ لوحة الإدارة
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="text-[#8A5700] hover:text-[#C37C00] font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gradient-to-r hover:from-[#FFF8E6] hover:to-[#FFF0CC] hover:shadow-lg hover:scale-105 transition-all duration-300"
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
                      className="w-full justify-center border-2 border-red-300 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 font-bold text-lg py-3 rounded-2xl transition-all duration-300 hover:scale-105 mt-4"
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
                      className="w-full border-2 border-[#C37C00]/40 text-[#8A5700] hover:text-white hover:bg-gradient-to-r hover:from-[#C37C00] hover:to-[#A66A00] font-bold text-lg py-4 rounded-2xl transition-all duration-300 hover:scale-105 bg-white"
                    >
                      🔑 تسجيل الدخول
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] hover:from-[#E6A500] hover:via-[#C37C00] hover:to-[#8A5700] text-white font-bold text-lg py-4 rounded-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
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
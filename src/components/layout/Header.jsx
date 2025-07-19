import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Menu, X, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isShopOwner, logout, isRegularUser } = useAuth();
  const { i18n, t } = useTranslation();
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

  // Language toggle function
  const toggleLanguage = () => {
    console.log('🌐 Current language:', i18n.language);
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    console.log('🌐 Switching to:', newLang);

    i18n.changeLanguage(newLang).then(() => {
      console.log('🌐 Language changed successfully to:', newLang);
      // Update document direction
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
      console.log('🌐 Document direction set to:', document.documentElement.dir);
    }).catch((error) => {
      console.error('🌐 Error changing language:', error);
    });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg border-b border-[#FFE6B3]/30 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        dir="ltr"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8E6]/20 via-white/40 to-[#FFF8E6]/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <Link to="/" className="flex items-center group relative">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src="/logo.webp"
                    alt="Dibla Logo"
                    className="w-12 h-12 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A37F41] via-[#C5A56D] to-[#8A6C37] rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3 hidden">
                    <div className="absolute inset-0 rounded-2xl border-2 border-white/30"></div>
                    <div className="absolute inset-2 bg-white/20 rounded-xl"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00] bg-clip-text text-transparent tracking-wide group-hover:tracking-wider transition-all duration-300">
                    Dibla
                  </span>
                  <span className="text-xs text-[#8A5700] font-semibold tracking-widest uppercase group-hover:text-[#C37C00] transition-all duration-300">
                    Premium Gold
                  </span>
                </div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-[#C37C00]/0 via-[#C37C00]/5 to-[#C37C00]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </Link>

            {/* Clean Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" dir="ltr">
              <Link
                to="/home"
                className="relative text-[#8A5700] hover:text-[#C37C00] font-medium text-lg transition-all duration-300 group px-3 py-2"
              >
                <span className="relative z-10">{t('home')}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C37C00] to-[#A66A00] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                to="/shops"
                className="relative text-[#8A5700] hover:text-[#C37C00] font-medium text-lg transition-all duration-300 group px-3 py-2"
              >
                <span className="relative z-10">{t('stores')}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C37C00] to-[#A66A00] group-hover:w-full transition-all duration-300"></span>
              </Link>
              {(isAuthenticated && user && (isShopOwner)) && (
                <Link
                  to="/dashboard"
                  className="relative text-[#8A5700] hover:text-[#C37C00] font-medium text-lg transition-all duration-300 group px-3 py-2"
                >
                  <span className="relative z-10">Dashboard</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C37C00] to-[#A66A00] group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
              {(isAuthenticated && user && (isRegularUser)) && (
                <Link
                  to="/favorites"
                  className="relative text-[#8A5700] hover:text-[#C37C00] font-medium text-lg transition-all duration-300 group px-3 py-2"
                >
                  <span className="relative z-10">Favorites</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C37C00] to-[#A66A00] group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="relative text-[#8A5700] hover:text-red-600 font-medium text-lg transition-all duration-300 group px-3 py-2"
                >
                  <span className="relative z-10">Admin</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
            </nav>

            {/* Clean Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Enhanced Language Toggle Button */}
              <Button
                variant="outline"
                onClick={toggleLanguage}
                className="border-2 border-[#C37C00] bg-[#FFF8E6] text-[#A66A00] hover:bg-[#FFF0CC] hover:border-[#A66A00] hover:text-[#8A5700] px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center gap-3 relative"
              >
                <Globe className="w-5 h-5" />
                <span className="text-base font-extrabold">
                  {i18n.language === 'ar' ? 'English' : 'عربي'}
                </span>
                {/* Current language indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#C37C00] rounded-full border-2 border-white"></div>
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-[#FFE6B3] shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-[#8A5700] font-medium">
                      {user?.firstName || user?.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-[#FFE6B3] text-[#A66A00] hover:bg-[#FFF8E6] transition-all duration-300 px-4 py-2 rounded-full"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-[#FFE6B3] text-[#C37C00] hover:bg-[#FFF8E6] transition-all duration-300 px-6 py-2 rounded-full font-medium"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white transition-all duration-300 transform hover:scale-105 px-6 py-2 rounded-full font-medium"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#FFE6B3]">
              <div className="flex flex-col space-y-4">
                <Link
                  to="/home"
                  className="text-[#8A5700] hover:text-[#C37C00]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/shops"
                  className="text-[#8A5700] hover:text-[#C37C00]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Stores
                </Link>

                {/* Enhanced Mobile Language Toggle */}
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('🌐 Mobile language toggle clicked');
                    toggleLanguage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start border-2 border-[#C37C00] bg-[#FFF8E6] text-[#A66A00] hover:bg-[#FFF0CC] hover:border-[#A66A00] hover:text-[#8A5700] font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 py-3"
                >
                  <Globe className="w-6 h-6" />
                  <span className="text-lg">
                    {i18n.language === 'ar' ? '🇺🇸 Switch to English' : '🇸🇦 ' + t('switch_to_arabic')}
                  </span>
                </Button>
                {(isAuthenticated && user) ? (
                  <>
                    <div className="flex items-center gap-2 py-2 border-b border-[#FFE6B3] mb-2">
                      <div className="w-8 h-8 bg-[#FFF0CC] rounded-full flex items-center justify-center">
                        <span className="text-[#C37C00] font-medium text-sm">
                          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-[#8A5700] font-medium">
                        Hello, {user?.firstName || user?.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                    {(isAdmin || isShopOwner) && (
                      <Link
                        to="/dashboard"
                        className="text-[#8A5700] hover:text-[#C37C00] font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-[#8A5700] hover:text-red-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start border-[#FFE6B3] text-[#A66A00] hover:bg-[#FFF8E6]"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full border-[#FFE6B3] text-[#A66A00] hover:bg-[#FFF8E6]"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white"
                    >
                      Sign Up
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
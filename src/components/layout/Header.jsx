import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isShopOwner, logout ,isRegularUser} = useAuth();
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
        className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg border-b border-yellow-200/30 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        dir="ltr"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/20 via-white/40 to-yellow-50/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Enhanced Logo */}
            <Link to="/" className="flex items-center group relative">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3"></div>
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/30"></div>
                  <div className="absolute inset-2 bg-white/20 rounded-xl"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent tracking-wide group-hover:tracking-wider transition-all duration-300">
                    Dibla
                  </span>
                  <span className="text-xs text-gray-600 font-semibold tracking-widest uppercase group-hover:text-yellow-600 transition-all duration-300">
                    Premium Gold
                  </span>
                </div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </Link>

            {/* Clean Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" dir="ltr">
              <Link
                to="/home"
                className="relative text-gray-700 hover:text-yellow-600 font-medium text-lg transition-all duration-300 group px-3 py-2"
              >
                <span className="relative z-10">Home</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link
                to="/shops"
                className="relative text-gray-700 hover:text-yellow-600 font-medium text-lg transition-all duration-300 group px-3 py-2"
              >
                <span className="relative z-10">Stores</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              {(isAuthenticated && user && (isShopOwner)) && (
                <Link   isRegularUser
                  to="/dashboard"
                  className="relative text-gray-700 hover:text-yellow-600 font-medium text-lg transition-all duration-300 group px-3 py-2"
                >
                  <span className="relative z-10">Dashboard</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
              {(isAuthenticated && user && (isRegularUser) ) && (
                <Link
                  to="/favorites"
                  className="relative text-gray-700 hover:text-yellow-600 font-medium text-lg transition-all duration-300 group px-3 py-2"
                >
                  <span className="relative z-10">Favorites</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="relative text-gray-700 hover:text-red-600 font-medium text-lg transition-all duration-300 group px-3 py-2"
                >
                  <span className="relative z-10">Admin</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-400 to-red-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              )}
            </nav>

            {/* Clean Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">
                      {user?.firstName || user?.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300 px-4 py-2 rounded-full"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 transition-all duration-300 px-6 py-2 rounded-full font-medium"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white transition-all duration-300 transform hover:scale-105 px-6 py-2 rounded-full font-medium"
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
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <Link
                  to="/home"
                  className="text-gray-700 hover:text-yellow-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/shops"
                  className="text-gray-700 hover:text-yellow-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Stores
                </Link>
                {(isAuthenticated && user) ? (
                  <>
                    <div className="flex items-center gap-2 py-2 border-b border-gray-200 mb-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-medium text-sm">
                          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium">
                        Hello, {user?.firstName || user?.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                    {(isAdmin || isShopOwner) && (
                      <Link
                        to="/dashboard"
                        className="text-gray-700 hover:text-yellow-600 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-red-600 font-medium"
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
                      className="w-full justify-start"
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
                      className="w-full"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
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
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X,
  ShoppingBag,
  Heart,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated, isStoreOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* الشعار */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Dibla</span>
          </Link>

          {/* شريط البحث - مخفي على الشاشات الصغيرة */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="ابحث عن المجوهرات والمحلات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 w-full"
                />
              </div>
            </form>
          </div>

          {/* قائمة التنقل والمستخدم */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* روابط التنقل - مخفية على الشاشات الصغيرة */}
            <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors hover:text-amber-600 ${
                  isActive('/') ? 'text-amber-600' : 'text-gray-700'
                }`}
              >
                الرئيسية
              </Link>
              <Link 
                to="/stores" 
                className={`text-sm font-medium transition-colors hover:text-amber-600 ${
                  isActive('/stores') ? 'text-amber-600' : 'text-gray-700'
                }`}
              >
                المحلات
              </Link>
              <Link 
                to="/collections" 
                className={`text-sm font-medium transition-colors hover:text-amber-600 ${
                  isActive('/collections') ? 'text-amber-600' : 'text-gray-700'
                }`}
              >
                المجموعات
              </Link>
              <Link 
                to="/about" 
                className={`text-sm font-medium transition-colors hover:text-amber-600 ${
                  isActive('/about') ? 'text-amber-600' : 'text-gray-700'
                }`}
              >
                عن دبلة
              </Link>
            </nav>

            {/* أيقونات المستخدم */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {/* أيقونات للمستخدم العادي */}
                {!isStoreOwner && (
                  <>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2">
                      <ShoppingBag className="w-5 h-5" />
                    </Button>
                  </>
                )}
                
                {/* قائمة المستخدم */}
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 rtl:space-x-reverse">
                    <User className="w-5 h-5" />
                    <span className="hidden sm:block">{user.firstName}</span>
                  </Button>
                  
                  {/* القائمة المنسدلة */}
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        to={isStoreOwner ? "/dashboard/store-owner" : "/dashboard/user"}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 ml-2" />
                        لوحة التحكم
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 ml-2" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Link to="/signin">
                  <Button variant="ghost" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                    إنشاء حساب
                  </Button>
                </Link>
              </div>
            )}

            {/* زر القائمة للهواتف */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* شريط البحث للهواتف */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="ابحث عن المجوهرات والمحلات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
          </form>
        </div>

        {/* القائمة المنسدلة للهواتف */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="py-4 space-y-2">
              <Link 
                to="/" 
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link 
                to="/stores" 
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                المحلات
              </Link>
              <Link 
                to="/collections" 
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                المجموعات
              </Link>
              <Link 
                to="/about" 
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                عن دبلة
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


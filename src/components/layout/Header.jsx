import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-yellow-600">Dibla</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/home" className="text-gray-700 hover:text-yellow-600">
              الرئيسية
            </Link>
            <Link to="/shops" className="text-gray-700 hover:text-yellow-600">
              المتاجر
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="text-gray-700 hover:text-yellow-600">
                لوحة التحكم
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-red-600 font-medium">
                إدارة النظام
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">مرحباً، {user?.firstName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                >
                  تسجيل الدخول
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  إنشاء حساب
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
                الرئيسية
              </Link>
              <Link
                to="/shops"
                className="text-gray-700 hover:text-yellow-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                المتاجر
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-yellow-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    لوحة التحكم
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-red-600 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      إدارة النظام
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
                    تسجيل الخروج
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
                    تسجيل الدخول
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    إنشاء حساب
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
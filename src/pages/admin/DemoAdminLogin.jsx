import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Shield, User, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const DemoAdminLogin = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoAdminLogin = async () => {
    try {
      setIsLoading(true);

      // Create a demo admin user
      const demoAdmin = {
        id: 'admin-demo-001',
        firstName: 'Admin',
        lastName: 'Demo',
        email: 'admin@dibla.com',
        role: 'admin',
        isDemo: true,
        createdAt: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(demoAdmin));
      localStorage.setItem('token', 'demo-admin-token-' + Date.now());
      localStorage.setItem('isAuthenticated', 'true');

      // Update auth context
      updateUser(demoAdmin);

      alert('تم تسجيل الدخول كـ Demo Admin بنجاح!');
      navigate(ROUTES.ADMIN_DASHBOARD);

    } catch (error) {
      console.error('Error with demo admin login:', error);
      alert('حدث خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoShopOwnerLogin = async () => {
    try {
      setIsLoading(true);

      // Create a demo shop owner user
      const demoShopOwner = {
        id: 'shop-owner-demo-001',
        firstName: 'Shop',
        lastName: 'Owner',
        email: 'shop@dibla.com',
        role: 'seller',
        isDemo: true,
        createdAt: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(demoShopOwner));
      localStorage.setItem('token', 'demo-shop-owner-token-' + Date.now());
      localStorage.setItem('isAuthenticated', 'true');

      // Update auth context
      updateUser(demoShopOwner);

      alert('تم تسجيل الدخول كـ Demo Shop Owner بنجاح!');
      navigate(ROUTES.DASHBOARD);

    } catch (error) {
      console.error('Error with demo shop owner login:', error);
      alert('حدث خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoCustomerLogin = async () => {
    try {
      setIsLoading(true);

      // Create a demo customer user
      const demoCustomer = {
        id: 'customer-demo-001',
        firstName: 'Customer',
        lastName: 'Demo',
        email: 'customer@dibla.com',
        role: 'customer',
        isDemo: true,
        createdAt: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(demoCustomer));
      localStorage.setItem('token', 'demo-customer-token-' + Date.now());
      localStorage.setItem('isAuthenticated', 'true');

      // Update auth context
      updateUser(demoCustomer);

      alert('تم تسجيل الدخول كـ Demo Customer بنجاح!');
      navigate(ROUTES.DASHBOARD);

    } catch (error) {
      console.error('Error with demo customer login:', error);
      alert('حدث خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Crown className="mx-auto h-12 w-12 text-yellow-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Demo Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            تسجيل دخول تجريبي للاختبار
          </p>
        </div>

        <div className="space-y-4">
          {/* Admin Demo */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Shield className="w-5 h-5" />
                Admin Demo
              </CardTitle>
              <CardDescription>
                دخول كـ أدمن للنظام مع جميع الصلاحيات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDemoAdminLogin}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isLoading ? 'جاري التسجيل...' : 'دخول كـ Admin'}
              </Button>
            </CardContent>
          </Card>

          {/* Shop Owner Demo */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <User className="w-5 h-5" />
                Shop Owner Demo
              </CardTitle>
              <CardDescription>
                دخول كـ صاحب متجر لإدارة المتجر والمنتجات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDemoShopOwnerLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                {isLoading ? 'جاري التسجيل...' : 'دخول كـ Shop Owner'}
              </Button>
            </CardContent>
          </Card>

          {/* Customer Demo */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <User className="w-5 h-5" />
                Customer Demo
              </CardTitle>
              <CardDescription>
                دخول كـ عميل للتصفح والشراء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDemoCustomerLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                {isLoading ? 'جاري التسجيل...' : 'دخول كـ Customer'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            تريد تسجيل دخول عادي؟{' '}
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoAdminLogin;

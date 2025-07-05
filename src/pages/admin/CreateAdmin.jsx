import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService.js';
import { ROUTES } from '../../utils/constants.js';

const CreateAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: '' // Secret key for admin creation
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Secret admin key (في التطبيق الحقيقي، هذا يجب أن يكون في البيئة الآمنة)
  const ADMIN_SECRET_KEY = 'DIBLA_ADMIN_2024';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (formData.adminKey !== ADMIN_SECRET_KEY) {
      alert('مفتاح الأدمن غير صحيح');
      return;
    }

    try {
      setIsLoading(true);

      // Register as normal user first, then promote to admin
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'customer' // Start as customer, will be promoted
      };

      const response = await authService.register(userData);

      // If registration successful, update role to admin locally
      if (response && response.user) {
        const adminUser = { ...response.user, role: 'admin' };
        localStorage.setItem('user', JSON.stringify(adminUser));
      }

      alert('تم إنشاء حساب الأدمن بنجاح! يمكنك الآن تسجيل الدخول.');
      navigate(ROUTES.LOGIN);

    } catch (error) {
      console.error('Error creating admin:', error);
      alert('حدث خطأ في إنشاء حساب الأدمن: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            إنشاء حساب أدمن
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            إنشاء حساب إداري للنظام
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>بيانات الأدمن</CardTitle>
            <CardDescription>
              أدخل البيانات المطلوبة لإنشاء حساب الأدمن
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الأول *
                  </label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="الاسم الأول"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الأخير *
                  </label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="الاسم الأخير"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور *
                </label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="تأكيد كلمة المرور"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مفتاح الأدمن *
                </label>
                <Input
                  name="adminKey"
                  type="password"
                  value={formData.adminKey}
                  onChange={handleInputChange}
                  placeholder="أدخل مفتاح الأدمن السري"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  المفتاح السري: DIBLA_ADMIN_2024
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isLoading ? 'جاري الإنشاء...' : 'إنشاء حساب الأدمن'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.LOGIN)}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            لديك حساب أدمن بالفعل؟{' '}
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="font-medium text-red-600 hover:text-red-500"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;

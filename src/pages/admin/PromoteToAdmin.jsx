import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Shield, UserCheck, ArrowLeft } from 'lucide-react';
import { userService } from '../../services/userService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const PromoteToAdmin = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Secret admin key
  const ADMIN_SECRET_KEY = 'DIBLA_ADMIN_2024';

  const handlePromoteCurrentUser = async (e) => {
    e.preventDefault();

    if (adminKey !== ADMIN_SECRET_KEY) {
      alert('مفتاح الأدمن غير صحيح');
      return;
    }

    try {
      setIsLoading(true);

      // Try to update role via API first
      try {
        await userService.updateRole('admin');
      } catch (apiError) {
        console.warn('API update failed, updating locally only:', apiError);

        // If API fails, update locally only (for demo purposes)
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, role: 'admin' };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Update local user state
      updateUser({ role: 'admin' });

      alert('تم ترقيتك إلى أدمن بنجاح! يمكنك الآن الوصول لإدارة النظام.');
      navigate(ROUTES.ADMIN_DASHBOARD);

    } catch (error) {
      console.error('Error promoting to admin:', error);
      alert('حدث خطأ في الترقية: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              يجب تسجيل الدخول أولاً
            </h3>
            <Button onClick={() => navigate(ROUTES.LOGIN)}>
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ترقية إلى أدمن
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ترقية حسابك الحالي إلى حساب إداري
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الحساب الحالي</CardTitle>
            <CardDescription>
              سيتم ترقية هذا الحساب إلى أدمن
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="font-medium">الحساب الحالي</span>
              </div>
              <p className="text-sm text-gray-600">
                <strong>الاسم:</strong> {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>البريد الإلكتروني:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>الدور الحالي:</strong> {
                  user.role === 'customer' ? 'عميل' :
                    user.role === 'seller' ? 'صاحب متجر' :
                      user.role === 'admin' ? 'أدمن' : user.role
                }
              </p>
            </div>

            {user.role === 'admin' ? (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">
                    أنت أدمن بالفعل!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    يمكنك الوصول لإدارة النظام
                  </p>
                </div>
                <Button
                  className="mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
                >
                  الذهاب لإدارة النظام
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePromoteCurrentUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مفتاح الأدمن *
                  </label>
                  <Input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="أدخل مفتاح الأدمن السري"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    المفتاح السري: DIBLA_ADMIN_2024
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>تحذير:</strong> بعد الترقية إلى أدمن، ستحصل على صلاحيات كاملة لإدارة النظام.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {isLoading ? 'جاري الترقية...' : 'ترقية إلى أدمن'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    العودة
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            تريد إنشاء حساب أدمن جديد؟{' '}
            <button
              onClick={() => navigate('/admin/create')}
              className="font-medium text-red-600 hover:text-red-500"
            >
              إنشاء حساب أدمن
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromoteToAdmin;

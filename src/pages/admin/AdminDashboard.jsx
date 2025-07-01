import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Users,
  Store,
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { shopService } from '../../services/shopService.js';
import { userService } from '../../services/userService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import { testAuthentication } from '../../utils/testAuth.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalShops: 0,
    pendingShops: 0,
    approvedShops: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [pendingShops, setPendingShops] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadAdminData();

    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      loadAdminData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, isAdmin, navigate]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      let shopsData = [];

      // Load all shops (including pending) - use admin endpoint
      try {
        const shopsResponse = await shopService.getAllShopsAdmin();
        shopsData = Array.isArray(shopsResponse) ? shopsResponse : shopsResponse.data || [];
        console.log('Admin shops loaded:', shopsData);
      } catch (error) {
        console.warn('Admin endpoint failed, trying regular endpoint:', error);
        // Fallback to regular endpoint
        try {
          const shopsResponse = await shopService.getAllShops();
          shopsData = Array.isArray(shopsResponse) ? shopsResponse : shopsResponse.data || [];
          console.log('Regular shops loaded:', shopsData);
        } catch (fallbackError) {
          console.error('Both endpoints failed:', fallbackError);
          shopsData = [];
        }
      }

      setAllShops(shopsData);

      // Filter pending shops - use the backend field 'isApproved'
      const pendingShops = shopsData.filter(shop => {
        // A shop is pending if it's not approved (isApproved === false or undefined)
        const isPending = !shop.isApproved;

        console.log(`Shop "${shop.name}" pending check:`, {
          id: shop._id || shop.id,
          isApproved: shop.isApproved,
          isPending: isPending
        });

        return isPending;
      });

      console.log('Pending shops found:', pendingShops.length);
      console.log('Pending shop names:', pendingShops.map(s => s.name));
      setPendingShops(pendingShops);

      // Load users count
      let totalUsers = 0;
      try {
        const usersResponse = await userService.getAllUsers();
        const usersData = Array.isArray(usersResponse) ? usersResponse : usersResponse.data || [];
        totalUsers = usersData.length;
      } catch (error) {
        console.warn('Could not load users count:', error);
        totalUsers = 0;
      }

      // Calculate real stats using backend field 'isApproved'
      const pendingCount = shopsData.filter(shop => !shop.isApproved).length;
      const approvedCount = shopsData.filter(shop => shop.isApproved).length;

      setStats({
        totalShops: shopsData.length,
        pendingShops: pendingCount,
        approvedShops: approvedCount,
        totalUsers: totalUsers,
        totalProducts: 0 // Will be calculated from products API
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      // Set empty state on error
      setAllShops([]);
      setPendingShops([]);
      setStats({
        totalShops: 0,
        pendingShops: 0,
        approvedShops: 0,
        totalUsers: 0,
        totalProducts: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveShop = async (shopId) => {
    const shop = allShops.find(s => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : 'المتجر';
    const actualShopId = shop?._id || shop?.id || shopId;

    console.log('=== APPROVE SHOP DEBUG ===');
    console.log('Original shopId:', shopId);
    console.log('Found shop:', shop);
    console.log('Shop name:', shopName);
    console.log('Actual shop ID:', actualShopId);
    console.log('User:', user);
    console.log('Is Admin:', isAdmin);
    console.log('Token from localStorage:', localStorage.getItem('dibla_token'));

    // Run authentication test
    testAuthentication();

    try {
      setIsLoading(true);
      console.log('Calling shopService.approveShop with ID:', actualShopId);

      const result = await shopService.approveShop(actualShopId);
      console.log('Approval result:', result);

      alert(`تم قبول متجر "${shopName}" بنجاح! سيظهر الآن للعملاء.`);

      // Reload data to reflect changes
      console.log('Reloading admin data...');
      await loadAdminData();

    } catch (error) {
      console.error('=== APPROVAL ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);

      const errorMessage = error.response?.data?.message || error.message || 'خطأ غير معروف';
      alert('حدث خطأ في الموافقة على المتجر: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectShop = async (shopId) => {
    const shop = allShops.find(s => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : 'المتجر';
    const actualShopId = shop?._id || shop?.id || shopId;

    const confirmed = window.confirm(
      `هل أنت متأكد من رفض متجر "${shopName}"؟\n\nسيتم إخفاء المتجر ولن يظهر للعملاء.`
    );

    if (confirmed) {
      try {
        setIsLoading(true);
        console.log('Rejecting shop with ID:', actualShopId);

        await shopService.rejectShop(actualShopId);

        alert(`تم رفض متجر "${shopName}". لن يظهر للعملاء.`);

        // Reload data to reflect changes
        await loadAdminData();

      } catch (error) {
        console.error('Error rejecting shop:', error);
        alert('حدث خطأ في رفض المتجر: ' + (error.message || 'خطأ غير معروف'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateLegacyShops = async () => {
    const confirmed = window.confirm(
      'هل تريد تحديث جميع المحلات القديمة لتصبح مُوافق عليها؟\n\nهذا سيجعل جميع المحلات التي لا تحتوي على حالة موافقة واضحة تظهر كمُوافق عليها.'
    );

    if (confirmed) {
      try {
        setIsLoading(true);

        // Find legacy shops (no status fields)
        const legacyShops = allShops.filter(shop =>
          !shop.hasOwnProperty('status') &&
          !shop.hasOwnProperty('approved') &&
          !shop.hasOwnProperty('isActive')
        );

        console.log('Found legacy shops:', legacyShops.length);

        // Update each legacy shop
        for (const shop of legacyShops) {
          try {
            await shopService.approveShop(shop._id || shop.id);
            console.log(`Updated legacy shop: ${shop.name}`);
          } catch (error) {
            console.error(`Failed to update shop ${shop.name}:`, error);
          }
        }

        alert(`تم تحديث ${legacyShops.length} متجر قديم بنجاح!`);

        // Reload data
        await loadAdminData();

      } catch (error) {
        console.error('Error updating legacy shops:', error);
        alert('حدث خطأ في تحديث المحلات القديمة');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteShop = async (shopId) => {
    // Try to find shop by both id and _id
    const shop = allShops.find(s => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : 'المتجر';

    // Use the correct ID format (prefer _id if available)
    const actualShopId = shop?._id || shop?.id || shopId;

    console.log('Shop to delete:', shop);
    console.log('Shop ID to use:', actualShopId);

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف متجر "${shopName}" نهائياً؟\n\nهذا الإجراء لا يمكن التراجع عنه وسيتم حذف:\n- بيانات المتجر\n- جميع المنتجات\n- جميع التقييمات\n- جميع الحجوزات المرتبطة`
    );

    if (confirmed) {
      try {
        setIsLoading(true);
        console.log('Deleting shop with ID:', actualShopId);

        await shopService.deleteShop(actualShopId);

        alert(`تم حذف متجر "${shopName}" بنجاح من قاعدة البيانات`);

        // Reload data to reflect changes
        await loadAdminData();

      } catch (error) {
        console.error('Error deleting shop:', error);
        console.error('Shop data:', shop);
        console.error('Shop ID used:', actualShopId);
        alert('حدث خطأ في حذف المتجر: ' + (error.message || 'خطأ غير معروف'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (shop) => {
    // Use the backend field 'isApproved' to determine status
    let status = 'unknown';

    if (shop.isApproved === true) {
      status = 'approved';
    } else if (shop.isApproved === false) {
      status = 'pending';
    } else {
      // If isApproved is undefined, assume pending
      status = 'pending';
    }

    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />في الانتظار</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />مُوافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />مرفوض</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم الأدمن</h1>
            <p className="text-gray-600">إدارة المتاجر والمستخدمين والموافقات</p>
          </div>
          <Button
            onClick={loadAdminData}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'جاري التحديث...' : 'تحديث البيانات'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Store className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">إجمالي المتاجر</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalShops}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingShops}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">مُوافق عليها</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedShops}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">المنتجات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="pending">
              الطلبات المعلقة ({stats.pendingShops})
            </TabsTrigger>
            <TabsTrigger value="shops">جميع المتاجر ({stats.totalShops})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>النشاط الأخير</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingShops.length > 0 ? (
                      pendingShops.slice(0, 3).map((shop, index) => (
                        <div key={shop.id} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <p className="text-sm">طلب جديد من متجر "{shop.name}"</p>
                          <span className="text-xs text-gray-500 mr-auto">
                            {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString('ar-EG') : 'حديث'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="text-sm">لا توجد طلبات معلقة</p>
                          <span className="text-xs text-gray-500 mr-auto">الآن</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <p className="text-sm">النظام يعمل بشكل طبيعي</p>
                          <span className="text-xs text-gray-500 mr-auto">مستمر</span>
                        </div>
                      </>
                    )}
                    {stats.totalShops > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <p className="text-sm">إجمالي {stats.totalShops} متجر في النظام</p>
                        <span className="text-xs text-gray-500 mr-auto">إحصائية</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab('pending')}
                    disabled={stats.pendingShops === 0}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    مراجعة الطلبات المعلقة ({stats.pendingShops})
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setActiveTab('shops')}
                  >
                    <Store className="w-4 h-4 mr-2" />
                    إدارة جميع المتاجر ({stats.totalShops})
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={loadAdminData}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    تحديث البيانات
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleUpdateLegacyShops}
                    disabled={isLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    تحديث المحلات القديمة
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">الطلبات المعلقة</h2>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {stats.pendingShops} طلب في الانتظار
              </Badge>
            </div>

            {pendingShops.length > 0 ? (
              <div className="grid gap-6">
                {pendingShops.map((shop) => (
                  <Card key={shop.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{shop.name}</h3>
                            {getStatusBadge(shop)}
                          </div>
                          <p className="text-gray-600 mb-3">{shop.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">العنوان:</span>
                              <p className="text-gray-600">{shop.address}</p>
                            </div>
                            <div>
                              <span className="font-medium">الهاتف:</span>
                              <p className="text-gray-600">{shop.phone}</p>
                            </div>
                            <div>
                              <span className="font-medium">تاريخ الطلب:</span>
                              <p className="text-gray-600">
                                {new Date(shop.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id || shop.id))}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            عرض
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveShop(shop._id || shop.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            موافقة
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectShop(shop._id || shop.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            رفض
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  لا توجد طلبات معلقة
                </h3>
                <p className="text-gray-600">
                  جميع طلبات المتاجر تم مراجعتها
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shops" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">جميع المتاجر</h2>
              <div className="flex gap-2">
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">جميع الحالات</option>
                  <option value="approved">مُوافق عليها</option>
                  <option value="pending">في الانتظار</option>
                  <option value="rejected">مرفوضة</option>
                </select>
              </div>
            </div>

            {allShops.length > 0 ? (
              <div className="grid gap-4">
                {allShops.map((shop) => (
                  <Card key={shop.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                            <Store className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{shop.name}</h4>
                              {getStatusBadge(shop)}
                            </div>
                            <p className="text-sm text-gray-600">{shop.address}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id || shop.id))}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            عرض
                          </Button>
                          {!shop.isApproved && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveShop(shop._id || shop.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                موافقة
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectShop(shop._id || shop.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                رفض
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteShop(shop._id || shop.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  لا توجد متاجر
                </h3>
                <p className="text-gray-600">
                  لم يتم إنشاء أي متاجر بعد
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
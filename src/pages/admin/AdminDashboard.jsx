import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
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
  RefreshCw,
  FileText
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
    approvedUnpaidShops: 0,
    activeShops: 0,
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

    // تحديث البيانات تلقائيًا كل 30 ثانية
    const interval = setInterval(() => {
      loadAdminData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, isAdmin, navigate]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      let shopsData = [];

      // تحميل جميع المتاجر (بما في ذلك المعلقة) - استخدام نقطة نهاية الإدارة
      try {
        const shopsResponse = await shopService.getAllShopsAdmin();
        shopsData = Array.isArray(shopsResponse) ? shopsResponse : shopsResponse.data || [];
        console.log('تم تحميل متاجر الإدارة:', shopsData);
      } catch (error) {
        console.warn('فشل نقطة نهاية الإدارة، جارٍ المحاولة بنقطة النهاية العادية:', error);
        // الرجوع إلى نقطة النهاية العادية
        try {
          const shopsResponse = await shopService.getAllShops();
          shopsData = Array.isArray(shopsResponse) ? shopsResponse : shopsResponse.data || [];
          console.log('تم تحميل المتاجر العادية:', shopsData);
        } catch (fallbackError) {
          console.error('فشلت كلتا نقطتي النهاية:', fallbackError);
          shopsData = [];
        }
      }

      setAllShops(shopsData);

      // تصفية المتاجر المعلقة - استخدام حقل 'isApproved' من الخلفية
      const pendingShops = shopsData.filter(shop => {
        // المتجر معلق إذا لم يتم الموافقة عليه (isApproved === false أو undefined)
        const isPending = !shop.isApproved;

        console.log(`فحص تعليق متجر "${shop.name}":`, {
          id: shop._id || shop.id,
          isApproved: shop.isApproved,
          isPending: isPending
        });

        return isPending;
      });

      console.log('عدد المتاجر المعلقة:', pendingShops.length);
      console.log('أسماء المتاجر المعلقة:', pendingShops.map(s => s.name));
      setPendingShops(pendingShops);

      // تحميل عدد المستخدمين
      let totalUsers = 0;
      try {
        const usersResponse = await userService.getAllUsers();
        const usersData = Array.isArray(usersResponse) ? usersResponse : usersResponse.data || [];
        totalUsers = usersData.length;
      } catch (error) {
        console.warn('تعذر تحميل عدد المستخدمين:', error);
        totalUsers = 0;
      }

      // حساب الإحصائيات الحقيقية باستخدام الحقول من الخلفية
      const pendingCount = shopsData.filter(shop => !shop.isApproved).length;
      const approvedCount = shopsData.filter(shop => shop.isApproved).length;
      const approvedUnpaidCount = shopsData.filter(shop => shop.isApproved && !shop.isPaid).length;
      const activeCount = shopsData.filter(shop => shop.isApproved && shop.isPaid).length;

      setStats({
        totalShops: shopsData.length,
        pendingShops: pendingCount,
        approvedShops: approvedCount,
        approvedUnpaidShops: approvedUnpaidCount,
        activeShops: activeCount,
        totalUsers: totalUsers,
        totalProducts: 0 // سيتم حسابه من واجهة برمجة تطبيقات المنتجات
      });

    } catch (error) {
      console.error('خطأ في تحميل بيانات الإدارة:', error);
      // تعيين حالة فارغة عند الخطأ
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

    console.log('=== تصحيح الموافقة على المتجر ===');
    console.log('معرف المتجر الأصلي:', shopId);
    console.log('المتجر الموجود:', shop);
    console.log('اسم المتجر:', shopName);
    console.log('معرف المتجر الفعلي:', actualShopId);
    console.log('المستخدم:', user);
    console.log('هل هو مدير:', isAdmin);
    console.log('الرمز من التخزين المحلي:', localStorage.getItem('dibla_token'));

    // إجراء اختبار التوثيق
    testAuthentication();

    try {
      setIsLoading(true);
      console.log('استدعاء shopService.approveShopActivation بمعرف:', actualShopId);

      const result = await shopService.approveShopActivation(actualShopId);
      console.log('نتيجة الموافقة:', result);

      alert(
        `✅ تم الموافقة على طلب تفعيل متجر "${shopName}" بنجاح!\n\n` +
        '📧 تم إرسال إشعار فوري لصاحب المتجر\n' +
        '💳 يمكن لصاحب المتجر الآن المتابعة لعملية الدفع'
      );

      // إعادة تحميل البيانات لتعكس التغييرات
      console.log('جارٍ إعادة تحميل بيانات الإدارة...');
      await loadAdminData();

    } catch (error) {
      console.error('=== خطأ في الموافقة ===');
      console.error('كائن الخطأ:', error);
      console.error('رسالة الخطأ:', error.message);
      console.error('استجابة الخطأ:', error.response);
      console.error('بيانات استجابة الخطأ:', error.response?.data);
      console.error('حالة استجابة الخطأ:', error.response?.status);

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
        console.log('رفض المتجر بمعرف:', actualShopId);

        await shopService.rejectShop(actualShopId);

        alert(`تم رفض متجر "${shopName}". لن يظهر للعملاء.`);

        // إعادة تحميل البيانات لتعكس التغييرات
        await loadAdminData();

      } catch (error) {
        console.error('خطأ في رفض المتجر:', error);
        alert('حدث خطأ في رفض المتجر: ' + (error.message || 'خطأ غير معروف'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateLegacyShops = async () => {
    const confirmed = window.confirm(
      'هل تريد تحديث جميع المتاجر القديمة لتصبح مُوافق عليها؟\n\nهذا سيجعل جميع المتاجر التي لا تحتوي على حالة موافقة واضحة تظهر كمُوافق عليها.'
    );

    if (confirmed) {
      try {
        setIsLoading(true);

        // البحث عن المتاجر القديمة (بدون حقول الحالة)
        const legacyShops = allShops.filter(shop =>
          !Object.prototype.hasOwnProperty.call(shop, 'status') &&
          !Object.prototype.hasOwnProperty.call(shop, 'approved') &&
          !Object.prototype.hasOwnProperty.call(shop, 'isActive')
        );

        console.log('تم العثور على متاجر قديمة:', legacyShops.length);

        // تحديث كل متجر قديم
        for (const shop of legacyShops) {
          try {
            await shopService.approveShopActivation(shop._id || shop.id);
            console.log(`تم تحديث المتجر القديم: ${shop.name}`);
          } catch (error) {
            console.error(`فشل تحديث المتجر ${shop.name}:`, error);
          }
        }

        alert(`تم تحديث ${legacyShops.length} متجر قديم بنجاح!`);

        // إعادة تحميل البيانات
        await loadAdminData();

      } catch (error) {
        console.error('خطأ في تحديث المتاجر القديمة:', error);
        alert('حدث خطأ في تحديث المتاجر القديمة');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteShop = async (shopId) => {
    const shop = allShops.find(s => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : 'المتجر';
    const actualShopId = shop?._id || shop?.id || shopId;

    console.log('المتجر المراد حذفه:', shop);
    console.log('معرف المتجر المستخدم:', actualShopId);

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف متجر "${shopName}" نهائياً؟\n\nهذا الإجراء لا يمكن التراجع عنه وسيتم حذف:\n- بيانات المتجر\n- جميع المنتجات\n- جميع التقييمات\n- جميع الحجوزات المرتبطة`
    );

    if (confirmed) {
      try {
        setIsLoading(true);
        console.log('حذف المتجر بمعرف:', actualShopId);

        await shopService.deleteShop(actualShopId);

        alert(`تم حذف متجر "${shopName}" بنجاح من قاعدة البيانات`);

        // إعادة تحميل البيانات لتعكس التغييرات
        await loadAdminData();

      } catch (error) {
        console.error('خطأ في حذف المتجر:', error);
        console.error('بيانات المتجر:', shop);
        console.error('معرف المتجر المستخدم:', actualShopId);
        alert('حدث خطأ في حذف المتجر: ' + (error.message || 'خطأ غير معروف'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (shop) => {
    let status = 'unknown';

    if (shop.isApproved === true) {
      status = 'approved';
    } else if (shop.isApproved === false) {
      status = 'pending';
    } else {
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

  // دالة لفتح الـ PDF باستخدام API مع الـ token
  const viewCommercialRecord = async (shop) => {
    const shopId = shop._id || shop.id;

    // التحقق من الـ token
    const token = localStorage.getItem('token');
    console.log('🔍 Token check:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenStart: token?.substring(0, 20) + '...',
      shopId: shopId
    });

    if (!token) {
      alert('❌ لا يوجد token. يرجى تسجيل الدخول مرة أخرى.');
      return;
    }

    try {
      console.log('📤 Attempting to download PDF for shop:', shopId);
      await shopService.downloadCommercialRecord(shopId);
      console.log('✅ PDF download successful');
    } catch (error) {
      console.error('❌ خطأ في عرض السجل التجاري:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        alert('❌ انتهت صلاحية تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.');
        // يمكن إضافة redirect للـ login هنا
      } else {
        alert('حدث خطأ في عرض السجل التجاري: ' + (error.message || 'خطأ غير معروف'));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-amber-50/20 flex items-center justify-center pt-20">
        <div className="bg-white rounded-2xl border border-yellow-200/30 backdrop-blur-sm p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-100 border-t-yellow-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">جارٍ تحميل لوحة التحكم...</h3>
          <p className="text-gray-600">يرجى الانتظار بينما نجلب أحدث البيانات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-amber-50/20 flex pt-20">
      {/* الشريط الجانبي للتنقل */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
        {/* رأس الشريط الجانبي */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                لوحة تحكم الإدارة
              </h1>
              <p className="text-sm text-gray-500">لوحة الإدارة</p>
            </div>
          </div>
        </div>

        {/* قائمة التنقل */}
        <div className="flex-1 p-6">
          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#A37F41] to-[#8A6C37] text-white'
                : 'text-gray-700 hover:bg-[#F8F4ED]'
                }`}
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              <span className="font-medium">نظرة عامة</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === 'pending'
                ? 'bg-gradient-to-r from-[#C5A56D] to-[#A37F41] text-white'
                : 'text-gray-700 hover:bg-[#F8F4ED]'
                }`}
            >
              <Clock className="w-5 h-5 mr-3" />
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">طلبات الموافقة</span>
                {stats.pendingShops > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${activeTab === 'pending' ? 'bg-white/20' : 'bg-[#F0E8DB] text-[#A37F41]'
                    }`}>
                    {stats.pendingShops}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('shops')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === 'shops'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                : 'text-gray-700 hover:bg-yellow-50'
                }`}
            >
              <Store className="w-5 h-5 mr-3" />
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">جميع المتاجر</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${activeTab === 'shops' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {stats.totalShops}
                </span>
              </div>
            </button>
          </nav>

          {/* إحصائيات سريعة في الشريط الجانبي */}
          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">إحصائيات سريعة</h3>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">المنتجات</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* تذييل الشريط الجانبي */}
        <div className="p-6 border-t border-gray-100">
          <Button
            onClick={loadAdminData}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white transition-all duration-200 py-3 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'جارٍ التحديث...' : 'تحديث البيانات'}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-3">
            آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
          </p>
        </div>
      </div>

      {/* منطقة المحتوى الرئيسية */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">

          {/* بطاقات الإحصائيات المحسنة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700 mb-1">إجمالي المتاجر</p>
                    <p className="text-3xl font-bold text-yellow-900">{stats.totalShops}</p>
                    <p className="text-xs text-yellow-600 mt-1">نشطة في النظام</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">معلقة</p>
                    <p className="text-3xl font-bold text-amber-900">{stats.pendingShops}</p>
                    <p className="text-xs text-amber-600 mt-1">في انتظار الموافقة</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">مُوافق عليها (غير مدفوعة)</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.approvedUnpaidShops}</p>
                    <p className="text-xs text-blue-600 mt-1">في انتظار الدفع</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">نشطة</p>
                    <p className="text-3xl font-bold text-green-900">{stats.activeShops}</p>
                    <p className="text-xs text-green-600 mt-1">متاجر نشطة</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">المستخدمون</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-600 mt-1">المستخدمون المسجلون</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">المنتجات</p>
                    <p className="text-3xl font-bold text-amber-900">{stats.totalProducts}</p>
                    <p className="text-xs text-amber-600 mt-1">إجمالي المنتجات</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* المحتوى بناءً على علامة التبويب النشطة */}
          <div className="space-y-8">

            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* الأنشطة الأخيرة المحسنة */}
                  <Card className="bg-white border-0 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                      <CardTitle className="flex items-center text-xl font-semibold">
                        <Calendar className="w-5 h-5 mr-3" />
                        الأنشطة الأخيرة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {pendingShops.length > 0 ? (
                          pendingShops.slice(0, 3).map((shop) => (
                            <div key={shop.id} className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                              <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-pulse"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">طلب جديد من "{shop.name}"</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString('ar-EG') : 'حديث'}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                                معلق
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">لا توجد طلبات معلقة</p>
                                <p className="text-xs text-gray-500 mt-1">كل شيء مكتمل!</p>
                              </div>
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
                                مكتمل
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">النظام يعمل بشكل طبيعي</p>
                                <p className="text-xs text-gray-500 mt-1">جميع الخدمات تعمل</p>
                              </div>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                نشط
                              </Badge>
                            </div>
                          </>
                        )}
                        {stats.totalShops > 0 && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">إجمالي {stats.totalShops} متجر في النظام</p>
                              <p className="text-xs text-gray-500 mt-1">إحصائيات النظام</p>
                            </div>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                              معلومات
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* الإجراءات السريعة المحسنة */}
                  <Card className="bg-white border-0 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#A37F41] to-[#8A6C37] text-white p-6">
                      <CardTitle className="flex items-center text-xl font-semibold">
                        <TrendingUp className="w-5 h-5 mr-3" />
                        إجراءات سريعة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-[#C5A56D] to-[#A37F41] hover:from-[#A37F41] hover:to-[#8A6C37] text-white transition-all duration-200 py-3 rounded-xl"
                        onClick={() => setActiveTab('pending')}
                        disabled={stats.pendingShops === 0}
                      >
                        <Clock className="w-5 h-5 mr-3" />
                        مراجعة طلبات الموافقة ({stats.pendingShops})
                      </Button>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-[#8A6C37] to-[#6D552C] hover:from-[#6D552C] hover:to-[#49391D] text-white transition-all duration-200 py-3 rounded-xl"
                        onClick={() => setActiveTab('shops')}
                      >
                        <Store className="w-5 h-5 mr-3" />
                        إدارة جميع المتاجر ({stats.totalShops})
                      </Button>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-[#D3BB92] to-[#C5A56D] hover:from-[#C5A56D] hover:to-[#A37F41] text-white transition-all duration-200 py-3 rounded-xl"
                        onClick={loadAdminData}
                      >
                        <RefreshCw className="w-5 h-5 mr-3" />
                        تحديث البيانات
                      </Button>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200 py-3 rounded-xl"
                        onClick={handleUpdateLegacyShops}
                        disabled={isLoading}
                      >
                        <CheckCircle className="w-5 h-5 mr-3" />
                        تحديث المتاجر القديمة
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#A37F41] to-[#8A6C37] bg-clip-text text-transparent">
                      طلبات الموافقة
                    </h2>
                    <Badge className="bg-gradient-to-r from-[#C5A56D] to-[#A37F41] text-white px-4 py-2 text-sm font-medium">
                      {stats.pendingShops} طلبات في الانتظار
                    </Badge>
                  </div>
                </div>

                {pendingShops.length > 0 ? (
                  <div className="grid gap-6">
                    {pendingShops.map((shop) => (
                      <Card key={shop.id} className="bg-white border-0 rounded-2xl overflow-hidden hover: transition-all duration-300 border-l-4 border-l-amber-500">
                        <CardContent className="p-8">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                                  <Store className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-xl text-gray-900 mb-1">{shop.name}</h3>
                                  {getStatusBadge(shop)}
                                </div>
                              </div>
                              <p className="text-gray-600 mb-6 text-base leading-relaxed">{shop.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <span className="font-semibold text-gray-900 block mb-2">العنوان:</span>
                                  <p className="text-gray-600">{shop.address}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <span className="font-semibold text-gray-900 block mb-2">الهاتف:</span>
                                  <p className="text-gray-600">{shop.phone}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <span className="font-semibold text-gray-900 block mb-2">تاريخ الطلب:</span>
                                  <p className="text-gray-600">
                                    {new Date(shop.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                                  </p>
                                </div>
                              </div>

                              {/* قسم السجل التجاري */}
                              {shop.commercialRecord && (
                                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-semibold text-blue-900 block mb-1">السجل التجاري:</span>
                                      <p className="text-blue-700 text-sm">انقر لعرض الوثيقة المرفوعة</p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg"
                                      onClick={() => viewCommercialRecord(shop)}
                                    >
                                      <FileText className="w-4 h-4 mr-2" />
                                      📄 عرض السجل التجاري
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-3 ml-6">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl"
                                onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id || shop.id))}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                عرض
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-200 px-4 py-2 rounded-xl"
                                onClick={() => handleApproveShop(shop._id || shop.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                الموافقة
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-200 px-4 py-2 rounded-xl"
                                onClick={() => handleRejectShop(shop._id || shop.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                الرفض
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-white/20 p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      لا توجد طلبات معلقة
                    </h3>
                    <p className="text-gray-600 text-lg">
                      تمت مراجعة جميع طلبات المتاجر
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shops' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      جميع المتاجر
                    </h2>
                    <div className="flex gap-3">
                      <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">كل الحالات</option>
                        <option value="approved">مُوافق عليه</option>
                        <option value="pending">معلق</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </div>
                  </div>
                </div>

                {allShops.length > 0 ? (
                  <div className="grid gap-6">
                    {allShops.map((shop) => (
                      <Card key={shop.id} className="bg-white border-0 rounded-2xl overflow-hidden hover: transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                                <Store className="w-8 h-8 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-bold text-lg text-gray-900">{shop.name}</h4>
                                  {getStatusBadge(shop)}
                                </div>
                                <p className="text-gray-600 font-medium">{shop.address}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  تاريخ الإنشاء: {new Date(shop.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl"
                                onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id || shop.id))}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                عرض
                              </Button>
                              {shop.commercialRecord && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 px-3 py-2 rounded-xl"
                                  onClick={() => viewCommercialRecord(shop)}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  📄 السجل
                                </Button>
                              )}
                              {!shop.isApproved && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-200 px-4 py-2 rounded-xl"
                                    onClick={() => handleApproveShop(shop._id || shop.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    الموافقة
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-200 px-4 py-2 rounded-xl"
                                    onClick={() => handleRejectShop(shop._id || shop.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    الرفض
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white transition-all duration-200 px-4 py-2 rounded-xl"
                                onClick={() => handleDeleteShop(shop._id || shop.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                حذف
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-white/20 p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Store className="w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      لا توجد متاجر
                    </h3>
                    <p className="text-gray-600 text-lg">
                      لم يتم إنشاء أي متاجر بعد
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
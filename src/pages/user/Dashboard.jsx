import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import {
  User,
  Heart,
  Calendar,
  Star,
  ShoppingBag,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Store,
  BarChart3,
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  QrCode,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import dashboardService from '../../services/dashboardService.js';
import { shopService } from '../../services/shopService.js';
import ManageRatings from '../seller/ManageRatings.jsx';
import { useShopNotifications } from '../../hooks/useShopNotifications.js';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isShopOwner, isRegularUser } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    favorites: 0,
    bookings: 0,
    activeBookings: 0,
    reviews: 0,
    shops: 0,
    products: 0,
    customers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);

  useEffect(() => {
    if (isRegularUser) {
      navigate('/');
      return;
    }
  }, [isRegularUser, navigate]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isShopOwner) {
          const shopStats = await dashboardService.getShopOwnerStats();
          const shopActivity = await dashboardService.getShopOwnerActivity();
          const shopData = await dashboardService.getShopOwnerShop();
          setStats(prev => ({ ...prev, ...shopStats.data }));
          setRecentActivity(shopActivity.data || []);
          setShopInfo(shopData.data);
        } else {
          const userStats = await dashboardService.getUserStats();
          const userActivity = await dashboardService.getUserActivity();
          setStats(prev => ({ ...prev, ...userStats.data }));
          setRecentActivity(userActivity.data || []);
        }

        const bookingsData = await dashboardService.getBookings();
        setBookings(bookingsData.data || []);


      } catch (err) {
        setError(err.message || 'خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, isShopOwner]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await dashboardService.cancelBooking(bookingId);
      const bookingsData = await dashboardService.getBookings();
      setBookings(bookingsData.data || []);
      alert('تم إلغاء الحجز بنجاح');
    } catch (err) {
      setError(err.message || 'خطأ في إلغاء الحجز');
    }
  };

  // Function to refresh shop data
  const refreshShopData = async () => {
    try {
      if (isShopOwner) {
        const shopData = await dashboardService.getShopOwnerShop();
        setShopInfo(shopData.data);
        console.log('Shop data refreshed:', shopData.data);
      }
    } catch (err) {
      console.error('Error refreshing shop data:', err);
    }
  };

  // Auto-refresh shop data every 30 seconds to catch status updates
  useEffect(() => {
    if (!isShopOwner || !shopInfo) return;

    const interval = setInterval(() => {
      refreshShopData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isShopOwner, shopInfo]);

  // استخدام hook الإشعارات
  useShopNotifications(
    // عند الموافقة
    (data) => {
      console.log('Shop approved, refreshing data...');
      refreshShopData();
    },
    // عند الرفض
    (data) => {
      console.log('Shop rejected, refreshing data...');
      refreshShopData();
    }
  );

  const handlePayment = async (shopId) => {
    const confirmed = window.confirm(
      'هل تريد المتابعة لدفع رسوم تفعيل المتجر؟\n\n' +
      '💰 المبلغ: 100 جنيه\n' +
      '🔒 الدفع آمن ومشفر\n' +
      '✅ سيتم تفعيل المتجر فوراً بعد الدفع'
    );

    if (confirmed) {
      try {
        setLoading(true);
        await shopService.payForShop(shopId);

        // Reload shop info
        await refreshShopData();

        alert('🎉 تم الدفع بنجاح! متجرك الآن نشط ومرئي للعملاء');
      } catch (err) {
        alert('خطأ في عملية الدفع: ' + (err.message || 'حاول مرة أخرى'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveFromFavorites = async (favoriteId) => {
    try {
      await dashboardService.removeFromFavorites(favoriteId);
      const favoritesData = await dashboardService.getFavorites();
      setFavorites(favoritesData.data || []);
      alert('تم حذف العنصر من المفضلة');
    } catch (err) {
      setError(err.message || 'خطأ في حذف العنصر من المفضلة');
    }
  };

  const colorMap = {
    yellow: { bg: 'bg-[#FFF0CC]', text: 'text-[#C37C00]' },
    blue: { bg: 'bg-[#FFE6B3]', text: 'text-[#A66A00]' },
    green: { bg: 'bg-[#FFDB99]', text: 'text-[#8A5700]' },
    purple: { bg: 'bg-[#FFF8E6]', text: 'text-[#B8850A]' },
  };

  const StatCard = ({ icon: IconComponent, title, value, description, color = 'yellow' }) => {
    const colorClasses = colorMap[color] || colorMap.yellow;
    return (
      <Card className="hover:shadow transition-all duration-300 bg-white border-secondary-2 rounded-lg font-cairo">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-900">{title}</p>
              <p className="text-2xl font-bold text-primary-500">{value}</p>
              {description && <p className="text-xs text-secondary-800 mt-1">{description}</p>}
            </div>
            <div className={`w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-md`}>
              <IconComponent className={`w-5 h-5 text-white`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'booking': return <Calendar className="w-4 h-4 text-[#C37C00]" />;
        case 'favorite': return <Heart className="w-4 h-4 text-[#C37C00]" />;
        case 'review': return <Star className="w-4 h-4 text-[#C37C00]" />;
        default: return <User className="w-4 h-4 text-[#C37C00]" />;
      }
    };

    const getStatusColor = () => {
      switch (activity.status) {
        case 'confirmed': return 'text-[#8A5700] bg-[#FFDB99]';
        case 'pending': return 'text-[#C37C00] bg-[#FFF0CC]';
        case 'completed': return 'text-[#A66A00] bg-[#FFE6B3]';
        default: return 'text-[#B8850A] bg-[#FFF8E6]';
      }
    };

    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-[#FFF8E6] rounded-lg transition-all duration-300">
        <div className="w-8 h-8 bg-[#FFF0CC] rounded-full flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#8A5700]">{activity.title}</p>
          <p className="text-xs text-[#A66A00]">{activity.date}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
          {activity.status}
        </span>
      </div>
    );
  };

  const FavoriteItem = ({ item }) => (
    <Card className="hover:shadow transition-all duration-300 bg-white/90 backdrop-blur-md rounded-lg">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <div className="w-16 h-16 bg-[#F0E8DB] rounded-lg flex items-center justify-center">
            <div className="text-2xl">💍</div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#6D552C]">{item.name}</h4>
            <p className="text-sm text-[#8A6C37]">{item.shop}</p>
            <p className="text-sm font-bold text-[#C37C00]">{item.price}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <Button
              size="sm"
              variant="outline"
              className="border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg"
              onClick={() => navigate(ROUTES.PRODUCT_DETAILS(item.id))}
              aria-label={`View ${item.name}`}
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-400 text-red-600 hover:bg-red-500 hover:text-white rounded-lg"
              onClick={() => handleRemoveFromFavorites(item.id)}
              aria-label={`Remove ${item.name} from favorites`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BookingItem = ({ booking }) => (
    <Card className="hover:shadow transition-all duration-300 bg-white/90 backdrop-blur-md rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-[#6D552C]">{booking.shop?.name || booking.shopName || 'متجر غير معروف'}</h4>
            <div className="flex items-center space-x-2 text-sm text-[#8A6C37] mt-1">
              <Calendar className="w-4 h-4" />
              <span>{booking.date || booking.appointmentDate || 'تاريخ غير معروف'}</span>
              <Clock className="w-4 h-4" />
              <span>{booking.time || booking.appointmentTime || 'وقت غير معروف'}</span>
            </div>
            <p className="text-xs text-[#92723A] mt-1">{booking.type || booking.serviceType || 'خدمة عامة'}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${booking.status === 'confirmed' || booking.status === 'approved'
                ? 'text-[#6D552C] bg-[#D3BB92]'
                : booking.status === 'pending'
                  ? 'text-[#A37F41] bg-[#F0E8DB]'
                  : booking.status === 'cancelled'
                    ? 'text-red-600 bg-red-100'
                    : 'text-[#92723A] bg-[#F8F4ED]'
                }`}
            >
              {booking.status === 'confirmed'
                ? 'مؤكد'
                : booking.status === 'approved'
                  ? 'موافق عليه'
                  : booking.status === 'pending'
                    ? 'في الانتظار'
                    : booking.status === 'cancelled'
                      ? 'ملغي'
                      : booking.status || 'غير معروف'}
            </span>
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg"
                  onClick={() => navigate(ROUTES.EDIT_BOOKING(booking._id || booking.id))}
                  aria-label="Edit booking"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-400 text-red-600 hover:bg-red-500 hover:text-white rounded-lg"
                  onClick={() => handleCancelBooking(booking._id || booking.id)}
                  aria-label="Cancel booking"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Shop Status Alert for Overview */}
      {isShopOwner && shopInfo && shopInfo.requestStatus !== 'approved' && (
        <div className={`border rounded-xl p-4 ${
          shopInfo.requestStatus === 'pending'
            ? 'bg-amber-50 border-amber-200'
            : shopInfo.requestStatus === 'rejected'
            ? 'bg-red-50 border-red-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center">
            <Clock className={`w-5 h-5 mr-3 ${
              shopInfo.requestStatus === 'pending'
                ? 'text-amber-600'
                : shopInfo.requestStatus === 'rejected'
                ? 'text-red-600'
                : 'text-gray-600'
            }`} />
            <div>
              <p className={`font-medium ${
                shopInfo.requestStatus === 'pending'
                  ? 'text-amber-800'
                  : shopInfo.requestStatus === 'rejected'
                  ? 'text-red-800'
                  : 'text-gray-800'
              }`}>
                {shopInfo.requestStatus === 'pending' && 'متجرك في انتظار الموافقة'}
                {shopInfo.requestStatus === 'rejected' && 'تم رفض طلب تفعيل المتجر'}
                {!shopInfo.requestStatus && 'يمكنك طلب تفعيل المتجر'}
              </p>
              <p className="text-amber-700 text-sm">سيتم مراجعة طلبك من قبل الإدارة خلال 24-48 ساعة</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} title="الحجوزات" value={stats.bookings} description={`${stats.activeBookings || 0} حجز نشط`} color="blue" />
        <StatCard icon={Star} title="التقييمات" value={stats.reviews} description="التقييمات المكتوبة" color="green" />
        {isShopOwner && (
          <>
            <StatCard icon={Store} title="المتاجر" value={stats.shops} description="المتاجر المسجلة" color="purple" />
            <StatCard icon={Package} title="المنتجات" value={stats.products} description="المنتجات المعروضة" color="yellow" />
          </>
        )}
      </div>
      <Card className="bg-white/90 backdrop-blur-md rounded-lg">
        <CardHeader>
          <CardTitle className="font-cairo">النشاط الأخير</CardTitle>
          <CardDescription className="font-tajawal">آخر الأنشطة والتحديثات</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#92723A] bg-white/80 rounded-lg">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-[#D3BB92]" />
              <p>لا توجد أنشطة حديثة</p>
              <p className="text-sm">ابدأ بتصفح المتاجر أو حجز المواعيد</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="bg-white/90 backdrop-blur-md rounded-lg">
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow transition-all duration-300"
              onClick={() => navigate(ROUTES.SHOPS)}
              aria-label="Browse shops"
            >
              <ShoppingBag className="w-6 h-6 mb-2" />
              <span className="text-sm">تصفح المتاجر</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-primary-500 text-primary-500 hover:bg-primary-1 rounded-lg shadow-md hover:shadow transition-all duration-300 font-cairo"
              onClick={() => setActiveTab('bookings')}
              aria-label="Book an appointment"
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm">حجز موعد</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-primary-500 text-primary-500 hover:bg-primary-1 rounded-lg shadow-md hover:shadow transition-all duration-300 font-cairo"
              onClick={() => navigate(ROUTES.PROFILE)}
              aria-label="View profile"
            >
              <User className="w-6 h-6 mb-2" />
              <span className="text-sm">حسابك</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BookingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {isShopOwner ? (
            <>
              <Button
                onClick={() => navigate(ROUTES.TIME_MANAGEMENT)}
                className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow transition-all duration-300"
                aria-label="Manage time"
              >
                <Clock className="w-4 h-4 mr-2" />
                إدارة الوقت
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.BOOKINGS_ONLY)}
                className="border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow transition-all duration-300"
                aria-label="View bookings only"
              >
                <Calendar className="w-4 h-4 mr-2" />
                عرض الحجوزات فقط
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate(ROUTES.SHOPS)}
              className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow transition-all duration-300"
              aria-label="Book new appointment"
            >
              <Plus className="w-4 h-4 mr-2" />
              حجز موعد جديد
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map(booking => <BookingItem key={booking._id || booking.id} booking={booking} />)
        ) : (
          <div className="text-center py-12 text-[#92723A] bg-white/90 backdrop-blur-md rounded-lg">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-[#D3BB92]" />
            <h3 className="text-lg font-medium font-cairo mb-2">لم يتم العثور على حجوزات</h3>
            <p className="mb-4 font-tajawal">ابدأ بحجز موعد في أحد المتاجر</p>
            <Button
              onClick={() => navigate(ROUTES.SHOPS)}
              className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow transition-all duration-300"
              aria-label="Browse shops"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              تصفح المتاجر
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const ShopOwnerTab = () => (
    <div className="space-y-8">
      {/* Shop Status Alert */}
      {shopInfo && (
        <div className={`rounded-xl p-6 border-l-4 ${
          shopInfo.requestStatus === 'approved' && user?.paid
            ? 'bg-green-50 border-green-500'
            : shopInfo.requestStatus === 'approved' && !user?.paid
              ? 'bg-blue-50 border-blue-500'
              : shopInfo.requestStatus === 'rejected'
                ? 'bg-red-50 border-red-500'
                : 'bg-amber-50 border-amber-500'
          }`}>
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
              shopInfo.requestStatus === 'approved' && user?.paid
                ? 'bg-green-100'
                : shopInfo.requestStatus === 'approved' && !user?.paid
                  ? 'bg-blue-100'
                  : shopInfo.requestStatus === 'rejected'
                    ? 'bg-red-100'
                    : 'bg-amber-100'
              }`}>
              {shopInfo.requestStatus === 'approved' && user?.paid ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : shopInfo.requestStatus === 'approved' && !user?.paid ? (
                <Clock className="w-6 h-6 text-blue-600" />
              ) : shopInfo.requestStatus === 'rejected' ? (
                <XCircle className="w-6 h-6 text-red-600" />
              ) : (
                <Clock className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-1 ${
                shopInfo.requestStatus === 'approved' && user?.paid
                  ? 'text-green-800'
                  : shopInfo.requestStatus === 'approved' && !user?.paid
                    ? 'text-blue-800'
                    : shopInfo.requestStatus === 'rejected'
                      ? 'text-red-800'
                      : 'text-amber-800'
                }`}>
                {shopInfo.requestStatus === 'approved' && user?.paid
                  ? 'متجرك نشط ومرئي للعملاء'
                  : shopInfo.requestStatus === 'approved' && !user?.paid
                    ? 'متجرك معتمد - يتطلب الدفع'
                    : shopInfo.requestStatus === 'rejected'
                      ? 'تم رفض طلب التفعيل'
                      : shopInfo.requestStatus === 'pending'
                        ? 'متجرك في انتظار الموافقة'
                        : 'يمكنك طلب تفعيل المتجر'}
              </h3>
              <p className={`text-sm ${
                shopInfo.requestStatus === 'approved' && user?.paid
                  ? 'text-green-700'
                  : shopInfo.requestStatus === 'approved' && !user?.paid
                    ? 'text-blue-700'
                    : shopInfo.requestStatus === 'rejected'
                      ? 'text-red-700'
                      : 'text-amber-700'
                }`}>
                {shopInfo.requestStatus === 'approved' && user?.paid
                  ? 'متجرك معتمد ومدفوع ومرئي للعملاء. يمكنك الآن إدارة المنتجات والحجوزات.'
                  : shopInfo.requestStatus === 'approved' && !user?.paid
                    ? 'تم اعتماد متجرك من قبل الإدارة. يرجى إكمال عملية الدفع لتفعيل المتجر.'
                    : shopInfo.requestStatus === 'rejected'
                      ? `تم رفض طلب التفعيل. ${shopInfo.rejectionReason ? `السبب: ${shopInfo.rejectionReason}` : ''}`
                      : shopInfo.requestStatus === 'pending'
                        ? 'تم إرسال طلبك بنجاح. سيتم مراجعته من قبل الإدارة خلال 24-48 ساعة.'
                        : 'يمكنك تقديم طلب تفعيل المتجر للمراجعة من قبل الإدارة.'}
              </p>
              {/* Action buttons based on shop status */}
              <div className="mt-4">
                {shopInfo.requestStatus === 'pending' && (
                  <div>
                    <p className="text-xs text-amber-600 mb-2">
                      📄 تم رفع السجل التجاري والمستندات المطلوبة • 🔔 ستتلقى إشعاراً عند الموافقة
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/shop/activation-request/${shopInfo._id}`)}
                        className="text-amber-600 border-amber-300 hover:bg-amber-50"
                      >
                        عرض حالة الطلب
                      </Button>
                      <Button
                        variant="outline"
                        onClick={refreshShopData}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        size="sm"
                      >
                        🔄 تحديث
                      </Button>
                    </div>
                  </div>
                )}

                {shopInfo.requestStatus === 'approved' && !user?.paid && (
                  <div>
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg mb-2"
                      onClick={() => navigate('/owner-payment')}
                    >
                      💳 ادفع الآن لتفعيل المتجر
                    </Button>
                    <p className="text-xs text-blue-600">
                      💰 رسوم التفعيل: 100 جنيه • 🔒 دفع آمن ومشفر
                    </p>
                  </div>
                )}

                {shopInfo.requestStatus === 'rejected' && (
                  <div>
                    <Button
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg mb-2"
                      onClick={() => navigate(`/shop/activation-request/${shopInfo._id}`)}
                    >
                      إعادة تقديم الطلب
                    </Button>
                    <p className="text-xs text-red-600">
                      يمكنك تعديل المتجر وإعادة تقديم طلب التفعيل
                    </p>
                  </div>
                )}

                {(!shopInfo.requestStatus || shopInfo.requestStatus === '') && (
                  <div>
                    <Button
                      className="bg-[#A37F41] hover:bg-[#8B6A35] text-white px-6 py-2 rounded-lg mb-2"
                      onClick={() => navigate(`/shop/activation-request/${shopInfo._id}`)}
                    >
                      طلب تفعيل المتجر
                    </Button>
                    <p className="text-xs text-gray-600">
                      قدم طلب تفعيل المتجر للمراجعة من قبل الإدارة
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Management Sections - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Shop Management */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] p-3 rounded-lg mr-4">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className='mr-5'>
              <h3 className="text-xl font-bold font-cairo text-[#8A5700]">إدارة المتاجر</h3>
              <p className="text-sm font-tajawal text-[#A66A00]">إنشاء وإدارة المتاجر</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#A66A00]">المتاجر النشطة</span>
                <span className="text-2xl font-bold text-[#8A5700]">{stats.shops || 0}</span>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow transition-all duration-300"
                  onClick={() => navigate(ROUTES.CREATE_SHOP)}
                  aria-label="Add new shop"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة متجر جديد
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow transition-all duration-300"
                  onClick={() => navigate(ROUTES.MANAGE_SHOP)}
                  aria-label="Manage existing shops"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  إدارة المتاجر الموجودة
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Product Management */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-[#A66A00] to-[#8A5700] p-3 rounded-lg mr-4">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className='mr-5'>
              <h3 className="text-xl font-bold font-cairo text-[#8A5700]">إدارة المنتجات</h3>
              <p className="text-sm font-tajawal text-[#A66A00]">إدارة كتالوج المنتجات</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#A66A00]">إجمالي المنتجات</span>
                <span className="text-2xl font-bold text-[#8A5700]">{stats.products || 0}</span>
              </div>

              {/* Product Management Requirements Alert */}
              {shopInfo && (shopInfo.requestStatus !== 'approved' || !user?.paid) && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="mr-3">
                      <h4 className="text-sm font-medium text-amber-800">متطلبات إدارة المنتجات</h4>
                      <div className="mt-1 text-sm text-amber-700">
                        <p>لإضافة وإدارة المنتجات، يجب:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li className={shopInfo.requestStatus === 'approved' ? 'text-green-600' : 'text-amber-700'}>
                            {shopInfo.requestStatus === 'approved' ? '✅' : '⏳'} موافقة الأدمن على المتجر
                          </li>
                          <li className={user?.paid ? 'text-green-600' : 'text-amber-700'}>
                            {user?.paid ? '✅' : '💳'} إتمام عملية الدفع
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  className={`w-full rounded-lg shadow-md hover:shadow transition-all duration-300 ${
                    shopInfo?.requestStatus === 'approved' && user?.paid
                      ? 'bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (shopInfo?.requestStatus === 'approved' && user?.paid) {
                      navigate(ROUTES.CREATE_PRODUCT);
                    } else {
                      alert('يجب موافقة الأدمن على المتجر وإتمام الدفع أولاً لإضافة المنتجات');
                    }
                  }}
                  disabled={shopInfo?.requestStatus !== 'approved' || !user?.paid}
                  aria-label="Add new product"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة منتج جديد
                </Button>
                <Button
                  variant="outline"
                  className={`w-full rounded-lg shadow-md hover:shadow transition-all duration-300 ${
                    shopInfo?.requestStatus === 'approved' && user?.paid
                      ? 'border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6]'
                      : 'border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (shopInfo?.requestStatus === 'approved' && user?.paid) {
                      navigate(ROUTES.MANAGE_SHOP);
                    } else {
                      alert('يجب موافقة الأدمن على المتجر وإتمام الدفع أولاً لإدارة المنتجات');
                    }
                  }}
                  disabled={shopInfo?.requestStatus !== 'approved' || !user?.paid}
                  aria-label="Manage products"
                >
                  <Package className="w-4 h-4 mr-2" />
                  إدارة المنتجات
                </Button>
                <Button
                  variant="outline"
                  className={`w-full rounded-lg shadow-md hover:shadow transition-all duration-300 ${
                    shopInfo?.requestStatus === 'approved' && user?.paid
                      ? 'border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6]'
                      : 'border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (shopInfo?.requestStatus === 'approved' && user?.paid) {
                      navigate(ROUTES.SHOP_QR_CODE);
                    } else {
                      alert('يجب موافقة الأدمن على المتجر وإتمام الدفع أولاً للوصول إلى QR Code');
                    }
                  }}
                  disabled={shopInfo?.requestStatus !== 'approved' || !user?.paid}
                  aria-label="Manage QR Code"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code المتجر
                </Button>

              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Appointment Management */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-[#8A5700] to-[#6D552C] p-3 rounded-lg mr-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className='mr-5'>
              <h3 className="text-xl font-bold font-cairo text-[#8A5700]">إدارة المواعيد</h3>
              <p className="text-sm font-tajawal text-[#A66A00]">إدارة المواعيد</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#A66A00]">الحجوزات النشطة</span>
                <span className="text-2xl font-bold text-[#8A5700]">{stats.bookings || 0}</span>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow transition-all duration-300"
                  onClick={() => navigate(ROUTES.TIME_MANAGEMENT)}
                  aria-label="Manage all appointments"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  إدارة جميع المواعيد
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow transition-all duration-300"
                  onClick={() => setActiveTab('available-times')}
                  aria-label="View time management"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  عرض إدارة الوقت
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Appointment Statistics */}
      <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-r from-[#6D552C] to-[#49391D] p-3 rounded-lg mr-4">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
            <div className='mr-5'>
            <h3 className="text-2xl font-bold font-cairo text-[#8A5700]">إحصائيات المواعيد</h3>
            <p className="font-tajawal text-[#A66A00]">تتبع أداء المواعيد والمقاييس الخاصة بك</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
            <div className="flex items-center justify-center mb-3 space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
              <span className="text-sm font-medium text-[#A66A00]">محجوز</span>
            </div>
            <span className="text-3xl font-bold text-[#8A5700]">{stats.bookings || 0}</span>
            <p className="text-xs text-[#A66A00] mt-1">المواعيد المؤكدة</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
            <div className="flex items-center justify-center mb-3 space-x-2">
              <Clock className="w-8 h-8 text-blue-600 mr-2 " />
              <span className="text-sm font-medium text-[#A66A00]">متاح</span>
            </div>
            <span className="text-3xl font-bold text-[#8A5700]">{stats.availableTimes || 0}</span>
            <p className="text-xs text-[#A66A00] mt-1">أوقات زمنية متاحة</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
            <div className="flex items-center justify-center mb-3 space-x-2">
              <Calendar className="w-8 h-8 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-[#A66A00]">الإجمالي</span>
            </div>
            <span className="text-3xl font-bold text-[#8A5700]">{(stats.bookings || 0) + (stats.availableTimes || 0)}</span>
            <p className="text-xs text-[#A66A00] mt-1">جميع المواعيد</p>
          </div>
        </div>
      </div>
    </div>
  );

  const AvailableTimesTab = () => {
    const [newTimeSlot, setNewTimeSlot] = useState({
      date: '',
      time: '',
      duration: 60,
    });
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTimeSlot = async () => {
      if (!newTimeSlot.date || !newTimeSlot.time) {
        alert('يرجى ملء جميع الحقول');
        return;
      }

      try {
        setIsAdding(true);
        if (!user || user.role !== 'seller') {
          alert('يجب أن تكون صاحب متجر لإضافة فترات زمنية');
          return;
        }

        const response = await dashboardService.addAvailableTime(newTimeSlot);
        if (response && (response.status === 'success' || response.data)) {
          const newTime = {
            ...response.data,
            date: newTimeSlot.date,
            time: newTimeSlot.time,
            isBooked: false,
            _id: response.data?._id || response._id || Date.now().toString(),
          };
          setAvailableTimes(prev => [...prev, newTime]);
          setNewTimeSlot({ date: '', time: '', duration: 60 });
          alert('تم إضافة الفترة الزمنية بنجاح');
        } else {
          throw new Error('فشل في حفظ الفترة الزمنية');
        }
      } catch (error) {
        alert(error.message || 'خطأ في إضافة الفترة الزمنية');
      } finally {
        setIsAdding(false);
      }
    };

    const handleDeleteTimeSlot = async (timeId) => {
      if (!confirm('هل أنت متأكد من حذف هذه الفترة الزمنية؟')) return;

      try {
        await dashboardService.deleteAvailableTime(timeId);
        setAvailableTimes(prev => prev.filter(time => time._id !== timeId));
        alert('تم حذف الفترة الزمنية بنجاح');
      } catch (error) {
        alert(error.message || 'خطأ في حذف الفترة الزمنية');
      }
    };

    const getTomorrowDate = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    };

    return (
      <div className="space-y-6">
        {isShopOwner && (
          <Card className="bg-white/90 backdrop-blur-md rounded-lg">
            <CardHeader>
              <CardTitle className="font-cairo">إضافة وقت متاح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D552C] mb-2">التاريخ</label>
                  <input
                    type="date"
                    min={getTomorrowDate()}
                    value={newTimeSlot.date}
                    onChange={e => setNewTimeSlot(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C37C00] bg-white/80"
                    aria-label="Select date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6D552C] mb-2">الوقت</label>
                  <input
                    type="time"
                    value={newTimeSlot.time}
                    onChange={e => setNewTimeSlot(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C37C00] bg-white/80"
                    aria-label="Select time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6D552C] mb-2">المدة (بالدقائق)</label>
                  <select
                    value={newTimeSlot.duration}
                    onChange={e => setNewTimeSlot(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C37C00] bg-white/80"
                    aria-label="Select duration"
                  >
                    <option value={30}>30 دقيقة</option>
                    <option value={60}>60 دقيقة</option>
                    <option value={90}>90 دقيقة</option>
                    <option value={120}>120 دقيقة</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddTimeSlot}
                    disabled={isAdding}
                    className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow transition-all duration-300"
                    aria-label="Add time slot"
                  >
                    {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    {isAdding ? 'جاري الإضافة...' : 'إضافة فترة زمنية'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="bg-white/90 backdrop-blur-md rounded-lg">
          <CardHeader>
            <CardTitle className="font-cairo">{isShopOwner ? `الأوقات المتاحة (${availableTimes.length})` : `مواعيدي المحجوزة (${availableTimes.length})`}</CardTitle>
          </CardHeader>
          <CardContent>
            {availableTimes.length > 0 ? (
              <div className="space-y-3">
                {availableTimes.map(timeSlot => (
                  <div key={timeSlot._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white/80">
                    <div className="flex items-center space-x-4">
                      {!isShopOwner && (
                        <div className="flex items-center space-x-2">
                          <Store className="w-4 h-4 text-[#8A6C37]" />
                          <span className="font-medium">{timeSlot.shop?.name || 'Unknown Shop'}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-[#8A6C37]" />
                        <span className="font-medium">{timeSlot.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-[#8A6C37]" />
                        <span>{timeSlot.time}</span>
                      </div>
                      <div className="text-sm text-[#92723A]">({timeSlot.duration} minutes)</div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${isShopOwner
                          ? timeSlot.isBooked
                            ? 'text-red-600 bg-red-100'
                            : 'text-[#6D552C] bg-[#D3BB92]'
                          : 'text-[#8A6C37] bg-[#E2D2B6]'
                          }`}
                      >
                        {isShopOwner
                          ? timeSlot.isBooked
                            ? 'محجوز'
                            : 'متاح'
                          : timeSlot.status === 'confirmed'
                            ? 'مؤكد'
                            : timeSlot.status || 'محجوز'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {isShopOwner && !timeSlot.isBooked && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTimeSlot(timeSlot._id)}
                          className="border-red-400 text-red-600 hover:bg-red-500 hover:text-white rounded-lg shadow-md hover:shadow transition-all duration-300"
                          aria-label="Delete time slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      {!isShopOwner && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(timeSlot._id)}
                          className="border-red-400 text-red-600 hover:bg-red-500 hover:text-white rounded-lg shadow-md hover:shadow transition-all duration-300"
                          aria-label="Cancel booking"
                        >
                          إلغاء الحجز
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#92723A] bg-white/80 rounded-lg">
                <Clock className="w-12 h-12 mx-auto mb-4 text-[#D3BB92]" />
                <p>{isShopOwner ? 'لا توجد أوقات متاحة' : 'لا توجد مواعيد محجوزة'}</p>
                <p className="text-sm">{isShopOwner ? 'أضف أوقات متاحة للعملاء للحجز' : 'ابدأ بحجز المواعيد في المتاجر'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const QRCodeTab = () => {
    const [qrCode, setQrCode] = useState(null);
    const [qrCodeLoading, setQrCodeLoading] = useState(false);

    // Load QR code when component mounts
    useEffect(() => {
      if (shopInfo && (shopInfo._id || shopInfo.id)) {
        loadQRCode(shopInfo._id || shopInfo.id);
      }
    }, [shopInfo]);

    const loadQRCode = async (shopId) => {
      try {
        setQrCodeLoading(true);
        const response = await shopService.getQRCode(shopId);
        setQrCode(response.data);
      } catch (error) {
        console.error('Error loading QR code:', error);
        // If QR code doesn't exist, try to generate it
        try {
          const generateResponse = await shopService.generateQRCode(shopId);
          setQrCode(generateResponse.data);
        } catch (generateError) {
          console.error('Error generating QR code:', generateError);
        }
      } finally {
        setQrCodeLoading(false);
      }
    };

    const generateNewQRCode = async () => {
      if (!shopInfo) return;

      try {
        setQrCodeLoading(true);
        const response = await shopService.generateQRCode(shopInfo._id || shopInfo.id);
        setQrCode(response.data);
        alert('تم توليد QR Code جديد بنجاح!');
      } catch (error) {
        console.error('Error generating QR code:', error);
        alert('حدث خطأ في توليد QR Code');
      } finally {
        setQrCodeLoading(false);
      }
    };

    const downloadQRCode = () => {
      if (!qrCode || !shopInfo) return;

      try {
        const link = document.createElement('a');
        link.href = qrCode.qrCode;

        const cleanShopName = shopInfo.name
          .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();

        link.download = `${cleanShopName}-QR-Code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading QR code:', error);
        alert('حدث خطأ في تحميل QR Code');
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code للمتجر
            </CardTitle>
            <CardDescription>
              يمكن للعملاء مسح هذا الكود للوصول مباشرة إلى صفحة متجرك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {qrCodeLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
                <p className="text-gray-600">جاري تحميل QR Code...</p>
              </div>
            ) : qrCode ? (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 text-center">
                      <img
                        src={qrCode.qrCode}
                        alt="QR Code"
                        className="w-64 h-64 mx-auto mb-4"
                      />
                      <p className="text-sm text-gray-600 mb-4">
                        يؤدي إلى: {qrCode.qrCodeUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-yellow-800 mb-2">
                        كيفية الاستخدام:
                      </h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• اطبع QR Code ووضعه في متجرك</li>
                        <li>• العملاء يمكنهم مسح الكود بالهاتف</li>
                        <li>• سيتم توجيههم مباشرة لصفحة متجرك</li>
                        <li>• يمكنهم تصفح منتجاتك وحجز مواعيد</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                   

                      <Button
                        onClick={downloadQRCode}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        تحميل QR Code
                      </Button>

                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  رابط المتجر غير متاح حالياً
                </h3>
                <p className="text-gray-600 mb-4">
                  شارك رابط متجرك مع العملاء عبر وسائل التواصل المختلفة
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate(ROUTES.SHOP_QR_CODE)}
                    className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    📤 مشاركة رابط المتجر
                  </Button>

                  <Button
                    onClick={generateNewQRCode}
                    variant="outline"
                    className="w-full"
                    disabled={qrCodeLoading}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {t('dashboard.generate_qr')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: t('dashboard.overview'), icon: BarChart3 },
    // { id: 'bookings', label: isShopOwner ? t('dashboard.bookings') : t('dashboard.my_bookings'), icon: Calendar },
    // { id: 'available-times', label: isShopOwner ? t('dashboard.available_times') : t('dashboard.my_appointments'), icon: Clock },
    ...(isShopOwner ? [
      { id: 'shop', label: t('dashboard.shop_management'), icon: Store },
      { id: 'ratings', label: t('dashboard.ratings'), icon: Star },
      { id: 'qr-code', label: t('dashboard.qr_code'), icon: QrCode }

    ] : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#C37C00]" />
          <p className="text-[#A66A00]">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-red-600 mb-4 text-4xl">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow transition-all duration-300"
            aria-label="Try again"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isRegularUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-3xl font-bold font-cairo text-[#8A5700] mb-4">تم رفض الوصول</h1>
          <p className="text-lg font-tajawal text-[#A66A00] mb-8">الوصول إلى لوحة التحكم مقتصر على أصحاب المتاجر والمديرين فقط.</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3 rounded-lg shadow-md hover:shadow transition-all duration-300"
            aria-label="Go to home"
          >
ارجع للصفحة الرئيسية          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 w-full font-cairo">
      <div className="flex w-full">
        {/* Main Content Area */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 lg:pr-80">
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-cairo text-primary-900">{t('dashboard.welcome', { name: user?.name || 'User' })}</h1>
            <p className="text-secondary-800 mt-1 font-cairo">{t('dashboard.manage_account')}</p>
          </div>

          {/* Mobile Navigation - Horizontal tabs for mobile */}
          <div className="lg:hidden sticky top-0 z-10 bg-white/90 backdrop-blur-md rounded-lg shadow mb-6">
            <nav className="flex space-x-2 p-4 border-b border-gray-200 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white shadow-md'
                      : 'text-[#A66A00] hover:bg-[#FFF8E6] hover:text-[#8A5700] hover:shadow-sm'
                      }`}
                    aria-label={`Switch to ${tab.label}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4">
            {activeTab === 'overview' && <OverviewTab />}
            {/* {activeTab === 'bookings' && <BookingsTab />} */}
            {activeTab === 'shop' && isShopOwner && <ShopOwnerTab />}
            {activeTab === 'ratings' && isShopOwner && <ManageRatings />}
            {activeTab === 'qr-code' && isShopOwner && <QRCodeTab />}
            {activeTab === 'available-times' && <AvailableTimesTab />}
          </div>
        </div>

        {/* Right Sidebar - Desktop only */}
        <div className="hidden lg:block fixed right-0 top-20 h-[calc(100vh-5rem)] w-72 bg-white/90 backdrop-blur-md shadow border-l border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold font-cairo text-[#8A5700] m-6">قائمة لوحة التحكم</h2>
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 text-left ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white shadow-md'
                      : 'text-[#A66A00] hover:bg-[#FFF8E6] hover:text-[#8A5700] hover:shadow-sm'
                      }`}
                    aria-label={`Switch to ${tab.label}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
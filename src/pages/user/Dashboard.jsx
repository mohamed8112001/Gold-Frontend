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
  Users,
  Package,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import dashboardService from '../../services/dashboardService.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isShopOwner, isRegularUser } = useAuth();
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
    customers: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

  // Check if user has access to dashboard
  useEffect(() => {
    if (isRegularUser) {
      // Redirect regular users away from dashboard
      navigate('/');
      return;
    }
  }, [isRegularUser, navigate]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load user stats
        if (isShopOwner) {
          const shopStats = await dashboardService.getShopOwnerStats();
          const shopActivity = await dashboardService.getShopOwnerActivity();
          setStats(prev => ({ ...prev, ...shopStats.data }));
          setRecentActivity(shopActivity.data || []);
        } else {
          const userStats = await dashboardService.getUserStats();
          const userActivity = await dashboardService.getUserActivity();
          setStats(prev => ({ ...prev, ...userStats.data }));
          setRecentActivity(userActivity.data || []);
        }

        // Load bookings
        const bookingsData = await dashboardService.getBookings();
        setBookings(bookingsData.data || []);

        // Load available times for shop owners
        if (isShopOwner) {
          try {
            const response = await dashboardService.getAvailableTimes();
            console.log('Dashboard - Shop owner available times FULL RESPONSE:', response);
            console.log('Dashboard - Response data type:', typeof response.data);
            console.log('Dashboard - Response data length:', response.data?.length);
            console.log('Dashboard - Response data content:', response.data);

            if (response && response.data) {
              console.log('Setting availableTimes with response.data:', response.data);
              setAvailableTimes(response.data);
            } else if (Array.isArray(response)) {
              console.log('Setting availableTimes with response array:', response);
              setAvailableTimes(response);
            } else {
              console.log('No valid data found, setting empty array');
              setAvailableTimes([]);
            }
          } catch (error) {
            console.error('Error loading available times:', error);
            setAvailableTimes([]);
          }
        } else {
          // Load user bookings for regular users
          try {
            const response = await dashboardService.getUserBookings();
            console.log('Dashboard - User bookings FULL RESPONSE:', response);
            console.log('Dashboard - Response data type:', typeof response.data);
            console.log('Dashboard - Response data length:', response.data?.length);
            console.log('Dashboard - Response data content:', response.data);

            if (response && response.data) {
              console.log('Setting availableTimes with response.data:', response.data);
              setAvailableTimes(response.data);
            } else if (Array.isArray(response)) {
              console.log('Setting availableTimes with response array:', response);
              setAvailableTimes(response);
            } else {
              console.log('No valid data found, setting empty array');
              setAvailableTimes([]);
            }
          } catch (error) {
            console.error('Error loading user bookings:', error);
            setAvailableTimes([]);
          }
        }

        // Load favorites (placeholder for now)
        // const favoritesData = await dashboardService.getFavorites();
        // setFavorites(favoritesData.data || []);

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, isShopOwner]);

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    try {
      await dashboardService.cancelBooking(bookingId);
      // Refresh bookings
      const bookingsData = await dashboardService.getBookings();
      setBookings(bookingsData.data || []);
      // Show success message (you can add a toast notification here)
      console.log('تم إلغاء الحجز بنجاح');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.message || 'حدث خطأ في إلغاء الحجز');
    }
  };

  // Handle remove from favorites
  const handleRemoveFromFavorites = async (favoriteId) => {
    try {
      await dashboardService.removeFromFavorites(favoriteId);
      // Refresh favorites
      const favoritesData = await dashboardService.getFavorites();
      setFavorites(favoritesData.data || []);
      console.log('تم إزالة العنصر من المفضلة');
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError(err.message || 'حدث خطأ في إزالة العنصر من المفضلة');
    }
  };

  // Map color names to Tailwind classes to avoid dynamic class issues
  const colorMap = {
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600'
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600'
    }
  };

  const StatCard = ({ icon: IconComponent, title, value, description, color = 'yellow' }) => {
    const colorClasses = colorMap[color] || colorMap.yellow;
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
            <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
              {IconComponent && <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'booking': return <Calendar className="w-4 h-4" />;
        case 'favorite': return <Heart className="w-4 h-4" />;
        case 'review': return <Star className="w-4 h-4" />;
        default: return <User className="w-4 h-4" />;
      }
    };

    const getStatusColor = () => {
      switch (activity.status) {
        case 'confirmed': return 'text-green-600 bg-green-100';
        case 'pending': return 'text-yellow-600 bg-yellow-100';
        case 'completed': return 'text-blue-600 bg-blue-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 hover:bg-gray-50 rounded-lg">
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
          <p className="text-xs text-gray-500">{activity.date}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
          {activity.status}
        </span>
      </div>
    );
  };

  const FavoriteItem = ({ item }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex space-x-3 rtl:space-x-reverse">
          <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
            <div className="text-2xl">💍</div>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            <p className="text-sm text-gray-600">{item.shop}</p>
            <p className="text-sm font-bold text-yellow-600">{item.price}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <Button size="sm" variant="outline">
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRemoveFromFavorites(item.id)}
              title="إزالة من المفضلة"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BookingItem = ({ booking }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{booking.shop?.name || booking.shopName || 'متجر غير محدد'}</h4>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 mt-1">
              <Calendar className="w-4 h-4" />
              <span>{booking.date || booking.appointmentDate || 'تاريخ غير محدد'}</span>
              <Clock className="w-4 h-4" />
              <span>{booking.time || booking.appointmentTime || 'وقت غير محدد'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{booking.type || booking.serviceType || 'خدمة عامة'}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`text-xs px-2 py-1 rounded-full ${(booking.status === 'confirmed' || booking.status === 'approved')
              ? 'text-green-600 bg-green-100'
              : booking.status === 'pending'
                ? 'text-yellow-600 bg-yellow-100'
                : booking.status === 'cancelled'
                  ? 'text-red-600 bg-red-100'
                  : 'text-gray-600 bg-gray-100'
              }`}>
              {booking.status === 'confirmed' ? 'مؤكد' :
                booking.status === 'approved' ? 'موافق عليه' :
                  booking.status === 'pending' ? 'في الانتظار' :
                    booking.status === 'cancelled' ? 'ملغي' :
                      booking.status || 'غير محدد'}
            </span>
            <div className="flex space-x-1">
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <>
                  <Button size="sm" variant="outline" title="تعديل الحجز">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="إلغاء الحجز"
                    onClick={() => handleCancelBooking(booking._id || booking.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Heart}
          title="المفضلة"
          value={stats.favorites}
          description="عنصر محفوظ"
        />
        <StatCard
          icon={Calendar}
          title="المواعيد"
          value={stats.bookings}
          description={`${stats.activeBookings || 0} موعد نشط`}
          color="blue"
        />
        <StatCard
          icon={Star}
          title="التقييمات"
          value={stats.reviews}
          description="تقييم مكتوب"
          color="green"
        />
        {isShopOwner && (
          <StatCard
            icon={Store}
            title="المتاجر"
            value={stats.shops}
            description="متجر مسجل"
            color="purple"
          />
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
          <CardDescription>آخر الأنشطة والتحديثات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد أنشطة حديثة</p>
                <p className="text-sm">ابدأ بتصفح المتاجر وحجز المواعيد</p>
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
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => navigate(ROUTES.SHOPS)}
            >
              <ShoppingBag className="w-6 h-6 mb-2" />
              <span className="text-sm">تصفح المتاجر</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm">حجز موعد</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => setActiveTab('favorites')}
            >
              <Heart className="w-6 h-6 mb-2" />
              <span className="text-sm">المفضلة</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => navigate(ROUTES.PROFILE)}
            >
              <User className="w-6 h-6 mb-2" />
              <span className="text-sm">الملف الشخصي</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FavoritesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المفضلة</h2>
          <p className="text-gray-600">العناصر المحفوظة لديك</p>
        </div>
        <Button onClick={() => navigate(ROUTES.PRODUCTS)}>
          <Plus className="w-4 h-4 mr-2" />
          تصفح المنتجات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.length > 0 ? (
          favorites.map((item) => (
            <FavoriteItem key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">لا توجد عناصر في المفضلة</h3>
            <p className="mb-4">ابدأ بإضافة المنتجات التي تعجبك إلى المفضلة</p>
            <Button onClick={() => navigate(ROUTES.SHOPS)}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              تصفح المنتجات
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const BookingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">المواعيد</h2>
          <p className="text-gray-600">مواعيدك المحجوزة</p>
        </div>
        <Button onClick={() => navigate(ROUTES.SHOPS)}>
          <Plus className="w-4 h-4 mr-2" />
          حجز موعد جديد
        </Button>
      </div>

      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <BookingItem key={booking._id || booking.id} booking={booking} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">لا توجد مواعيد محجوزة</h3>
            <p className="mb-4">ابدأ بحجز موعد في أحد المتاجر</p>
            <Button onClick={() => navigate(ROUTES.SHOPS)}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              تصفح المتاجر
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const ShopOwnerTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Store}
          title="المتاجر"
          value={stats.shops}
          description="متجر نشط"
          color="purple"
        />
        <StatCard
          icon={Package}
          title="المنتجات"
          value={stats.products}
          description="منتج معروض"
          color="blue"
        />
        <StatCard
          icon={Users}
          title="العملاء"
          value={stats.customers}
          description="عميل مسجل"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>إدارة المتاجر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" onClick={() => navigate(ROUTES.CREATE_SHOP)}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة متجر جديد
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(ROUTES.MANAGE_SHOP)}>
                <Edit className="w-4 h-4 mr-2" />
                إدارة المتاجر الحالية
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إدارة المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" onClick={() => navigate(ROUTES.CREATE_PRODUCT)}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة منتج جديد
              </Button>
              <Button variant="outline" className="w-full">
                <Package className="w-4 h-4 mr-2" />
                إدارة المنتجات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const AvailableTimesTab = () => {
    const [newTimeSlot, setNewTimeSlot] = useState({
      date: '',
      time: '',
      duration: 60 // مدة الموعد بالدقائق
    });
    const [isAdding, setIsAdding] = useState(false);







    const handleAddTimeSlot = async () => {
      if (!newTimeSlot.date || !newTimeSlot.time) {
        alert('يرجى ملء جميع الحقول');
        return;
      }

      try {
        setIsAdding(true);

        // استدعاء API لإضافة الموعد المتاح في قاعدة البيانات
        const response = await dashboardService.addAvailableTime(newTimeSlot);
        console.log('Add time slot response:', response);

        // إضافة الموعد الجديد للقائمة
        if (response && response.data) {
          setAvailableTimes(prev => [...prev, response.data]);
        } else if (response) {
          setAvailableTimes(prev => [...prev, response]);
        }

        // مسح النموذج
        setNewTimeSlot({ date: '', time: '', duration: 60 });

        // رسالة نجاح
        alert('تم إضافة الموعد بنجاح وحفظه في قاعدة البيانات');

      } catch (error) {
        console.error('Error adding time slot:', error);
        alert(error.message || 'حدث خطأ في إضافة الموعد');
      } finally {
        setIsAdding(false);
      }
    };

    const handleDeleteTimeSlot = async (timeId) => {
      if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;

      try {
        // استدعاء API لحذف الموعد من قاعدة البيانات
        await dashboardService.deleteAvailableTime(timeId);

        // إزالة الموعد من القائمة
        setAvailableTimes(prev => prev.filter(time => time._id !== timeId));

        // رسالة نجاح
        alert('تم حذف الموعد بنجاح من قاعدة البيانات');

      } catch (error) {
        console.error('Error deleting time slot:', error);
        alert(error.message || 'حدث خطأ في حذف الموعد');
      }
    };



    const getTomorrowDate = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isShopOwner ? 'إدارة المواعيد المتاحة' : 'مواعيدي المحجوزة'}
            </h2>
            <p className="text-gray-600">
              {isShopOwner ? 'إدارة المواعيد المتاحة للحجز' : 'مواعيدك المحجوزة في المتاجر'}
            </p>
          </div>
        </div>

        {/* إضافة موعد جديد - للمالكين فقط */}
        {isShopOwner && (
          <Card>
            <CardHeader>
              <CardTitle>إضافة موعد متاح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    min={getTomorrowDate()}
                    value={newTimeSlot.date}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوقت
                  </label>
                  <input
                    type="time"
                    value={newTimeSlot.time}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدة (دقيقة)
                  </label>
                  <select
                    value={newTimeSlot.duration}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                    className="w-full"
                  >
                    {isAdding ? 'جاري الإضافة...' : 'إضافة موعد'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* قائمة المواعيد */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isShopOwner ? `المواعيد المتاحة (${availableTimes.length})` : `مواعيدي المحجوزة (${availableTimes.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              console.log('Rendering availableTimes:', availableTimes);
              console.log('availableTimes length:', availableTimes.length);
              console.log('availableTimes type:', typeof availableTimes);
              return null;
            })()}
            {availableTimes.length > 0 ? (
              <div className="space-y-3">
                {availableTimes.map((timeSlot, index) => {
                  console.log(`Rendering timeSlot ${index}:`, timeSlot);
                  return (
                    <div key={timeSlot._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        {!isShopOwner && (
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Store className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{timeSlot.shop?.name || 'متجر غير محدد'}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{timeSlot.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{timeSlot.time}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          ({timeSlot.duration} دقيقة)
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${isShopOwner
                          ? (timeSlot.isBooked ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100')
                          : 'text-blue-600 bg-blue-100'
                          }`}>
                          {isShopOwner
                            ? (timeSlot.isBooked ? 'محجوز' : 'متاح')
                            : (timeSlot.status === 'confirmed' ? 'مؤكد' : timeSlot.status || 'محجوز')
                          }
                        </span>
                      </div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        {isShopOwner && !timeSlot.isBooked && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTimeSlot(timeSlot._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {!isShopOwner && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelBooking(timeSlot._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            إلغاء الحجز
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{isShopOwner ? 'لا توجد مواعيد متاحة' : 'لا توجد مواعيد محجوزة'}</p>
                <p className="text-sm">
                  {isShopOwner
                    ? 'أضف مواعيد متاحة ليتمكن العملاء من حجزها'
                    : 'ابدأ بحجز مواعيد من المتاجر المختلفة'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'favorites', label: 'المفضلة', icon: Heart },
    { id: 'bookings', label: 'المواعيد', icon: Calendar },
    { id: 'available-times', label: isShopOwner ? 'إدارة المواعيد' : 'مواعيدي', icon: Clock },
    ...(isShopOwner ? [
      { id: 'shop', label: 'إدارة المتجر', icon: Store }
    ] : [])
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // Show access denied message for regular users
  if (isRegularUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 flex items-center justify-center" dir="ltr">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-8">
            Dashboard access is restricted to shop owners and administrators only.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-full font-semibold"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            مرحباً، {user?.firstName || 'المستخدم'}
          </h1>
          <p className="text-gray-600 mt-1">
            إدارة حسابك ومتابعة أنشطتك
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 rtl:space-x-reverse py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'favorites' && <FavoritesTab />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'shop' && isShopOwner && <ShopOwnerTab />}
          {activeTab === 'available-times' && <AvailableTimesTab />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
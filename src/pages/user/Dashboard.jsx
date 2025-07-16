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
      console.log('Item removed from favorites');
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError(err.message || 'Error occurred while removing item from favorites');
    }
  };

  // Map color names to Tailwind classes to avoid dynamic class issues
  const colorMap = {
    yellow: {
      bg: 'bg-[#FFF0CC]',
      text: 'text-[#C37C00]'
    },
    blue: {
      bg: 'bg-[#FFE6B3]',
      text: 'text-[#A66A00]'
    },
    green: {
      bg: 'bg-[#FFDB99]',
      text: 'text-[#8A5700]'
    },
    purple: {
      bg: 'bg-[#FFF8E6]',
      text: 'text-[#B8850A]'
    }
  };

  const StatCard = ({ icon: IconComponent, title, value, description, color = 'yellow' }) => {
    const colorClasses = colorMap[color] || colorMap.yellow;
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#A66A00]">{title}</p>
              <p className="text-3xl font-bold text-[#8A5700]">{value}</p>
              {description && (
                <p className="text-xs text-[#B8850A] mt-1">{description}</p>
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
        case 'confirmed': return 'text-[#8A5700] bg-[#FFDB99]';
        case 'pending': return 'text-[#C37C00] bg-[#FFF0CC]';
        case 'completed': return 'text-[#A66A00] bg-[#FFE6B3]';
        default: return 'text-[#B8850A] bg-[#FFF8E6]';
      }
    };

    return (
      <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 hover:bg-[#FFF8E6] rounded-lg">
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex space-x-3 rtl:space-x-reverse">
          <div className="w-16 h-16 bg-[#F0E8DB] rounded-lg flex items-center justify-center">
            <div className="text-2xl">💍</div>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-[#6D552C]">{item.name}</h4>
            <p className="text-sm text-[#8A6C37]">{item.shop}</p>
            <p className="text-sm font-bold text-[#A37F41]">{item.price}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <Button size="sm" variant="outline">
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRemoveFromFavorites(item.id)}
              title="Remove from favorites"
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
            <h4 className="font-medium text-[#6D552C]">{booking.shop?.name || booking.shopName || 'متجر غير محدد'}</h4>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-[#8A6C37] mt-1">
              <Calendar className="w-4 h-4" />
              <span>{booking.date || booking.appointmentDate || 'تاريخ غير محدد'}</span>
              <Clock className="w-4 h-4" />
              <span>{booking.time || booking.appointmentTime || 'وقت غير محدد'}</span>
            </div>
            <p className="text-xs text-[#92723A] mt-1">{booking.type || booking.serviceType || 'خدمة عامة'}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`text-xs px-2 py-1 rounded-full ${(booking.status === 'confirmed' || booking.status === 'approved')
              ? 'text-[#6D552C] bg-[#D3BB92]'
              : booking.status === 'pending'
                ? 'text-[#A37F41] bg-[#F0E8DB]'
                : booking.status === 'cancelled'
                  ? 'text-red-600 bg-red-100'
                  : 'text-[#92723A] bg-[#F8F4ED]'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {/* <StatCard
          icon={Heart}
          title="Favorites"
          value={stats.favorites}
          description="saved items"
        /> */}
        <StatCard
          icon={Calendar}
          title="Bookings"
          value={stats.bookings}
          description={`${stats.activeBookings || 0} active bookings`}
          color="blue"
        />
        <StatCard
          icon={Star}
          title="Reviews"
          value={stats.reviews}
          description="reviews written"
          color="green"
        />
        {isShopOwner && (
          <StatCard
            icon={Store}
            title="Shops"
            value={stats.shops}
            description="registered shops"
            color="purple"
          />
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle> Recent activity</CardTitle>
          <CardDescription>Latest activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8 text-[#92723A]">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-[#D3BB92]" />
                <p>No recent activities</p>
                <p className="text-sm">Start browsing shops and booking appointments</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle> Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-3c gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6]"
              onClick={() => navigate(ROUTES.SHOPS)}
            >
              <ShoppingBag className="w-6 h-6 mb-2" />
              <span className="text-sm"> Browse stores</span>
            </Button>
            {/* <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm">Book an appointment </span>
            </Button> */}
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6]"
              onClick={() => setActiveTab('favorites')}
            >
              <Heart className="w-6 h-6 mb-2" />
              <span className="text-sm">Favorites</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6]"
              onClick={() => navigate(ROUTES.PROFILE)}
            >
              <User className="w-6 h-6 mb-2" />
              <span className="text-sm">Profile</span>
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
          <h2 className="text-2xl font-bold text-[#6D552C]">Favorites</h2>
          <p className="text-[#8A6C37]">Your saved items</p>
        </div>
        <Button onClick={() => navigate(ROUTES.PRODUCTS)}>
          <Plus className="w-4 h-4 mr-2" />
          Browse Products
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.length > 0 ? (
          favorites.map((item) => (
            <FavoriteItem key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-[#92723A]">
            <Heart className="w-16 h-16 mx-auto mb-4 text-[#D3BB92]" />
            <h3 className="text-lg font-medium mb-2">No items in favorites</h3>
            <p className="mb-4">Start adding products you like to your favorites</p>
            <Button onClick={() => navigate(ROUTES.SHOPS)}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Products
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
          <h2 className="text-2xl font-bold text-[#6D552C]">
            {isShopOwner ? 'Bookings Overview' : 'My Bookings'}
          </h2>
          <p className="text-[#8A6C37]">
            {isShopOwner ? 'Overview of your shop bookings' : 'Your booked appointments'}
          </p>
        </div>
        <div className="flex gap-2">
          {isShopOwner ? (
            <>
              <Button onClick={() => navigate(ROUTES.TIME_MANAGEMENT)}>
                <Clock className="w-4 h-4 mr-2" />
                Time Management
              </Button>
              <Button variant="outline" onClick={() => navigate(ROUTES.BOOKINGS_ONLY)}>
                <Calendar className="w-4 h-4 mr-2" />
                View Bookings Only
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate(ROUTES.SHOPS)}>
              <Plus className="w-4 h-4 mr-2" />
              Book New Appointment
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <BookingItem key={booking._id || booking.id} booking={booking} />
          ))
        ) : (
          <div className="text-center py-12 text-[#92723A]">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-[#D3BB92]" />
            <h3 className="text-lg font-medium mb-2">No appointments booked</h3>            <p className="mb-4">Start by booking an appointment at a store</p>            <Button onClick={() => navigate(ROUTES.SHOPS)}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse stores            </Button>
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
          title="Shop"
          value={stats.shops}
          description="Active Shop"
          color="purple"
        />
        <StatCard
          icon={Package}
          title="Products"
          value={stats.products}
          description="Displayed product"
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Users"
          value={stats.customers}
          description=" Registered customer"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Management</CardTitle>          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white" onClick={() => navigate(ROUTES.CREATE_SHOP)}>
                <Plus className="w-4 h-4 mr-2" />
                Add a new store              </Button>
              <Button variant="outline" className="w-full border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6]" onClick={() => navigate(ROUTES.MANAGE_SHOP)}>
                <Edit className="w-4 h-4 mr-2" />
                Managing existing stores              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Management</CardTitle>          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white" onClick={() => navigate(ROUTES.CREATE_PRODUCT)}>
                <Plus className="w-4 h-4 mr-2" />
                Add a new product              </Button>
              <Button variant="outline" className="w-full border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6]">
                <Package className="w-4 h-4 mr-2" />
                Product management              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Appointment Management</CardTitle>          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-100 bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white" onClick={() => navigate(ROUTES.TIME_MANAGEMENT)}>
                <Clock className="w-4 h-4 mr-2" />
                Manage all appointments              </Button>
              {/* <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6]" onClick={() => navigate(ROUTES.MANAGE_TIMES)}>
                  Add appointment times
                </Button>
                <Button variant="outline" size="sm" className="border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6]" onClick={() => navigate(ROUTES.BOOKINGS_ONLY)}>
                  Booked appointments                </Button>
              </div> */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Statistics</CardTitle>          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#A66A00]">Booked appointments </span>
                <span className="font-semibold text-[#8A5700]">{stats.bookings || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#A66A00]">Available appointments </span>
                <span className="font-semibold text-[#A66A00]">{stats.availableTimes || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#A66A00]">Total appointments
                </span>
                <span className="font-semibold text-[#8A5700]">{(stats.bookings || 0) + (stats.availableTimes || 0)}</span>
              </div>
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

      console.log('=== DASHBOARD: STARTING ADD TIME SLOT ===');
      console.log('Adding time slot:', newTimeSlot);
      console.log('User info:', user);
      console.log('User role:', user?.role);
      console.log('Is seller?', user?.role === 'seller');

      try {
        setIsAdding(true);

        // تحقق من أن المستخدم shop owner
        if (!user || user.role !== 'seller') {
          alert('يجب أن تكون صاحب محل لإضافة المواعيد');
          return;
        }

        // استدعاء API لإضافة الموعد المتاح في قاعدة البيانات
        const response = await dashboardService.addAvailableTime(newTimeSlot);
        console.log('Add time slot response:', response);

        // تحقق من نجاح العملية قبل إضافة الموعد للقائمة
        if (response && (response.status === 'success' || response.data)) {
          // إضافة الموعد الجديد للقائمة فقط إذا تم حفظه بنجاح
          const newTime = {
            ...response.data,
            date: newTimeSlot.date,
            time: newTimeSlot.time,
            isBooked: false,
            _id: response.data?._id || response._id || Date.now().toString()
          };

          setAvailableTimes(prev => [...prev, newTime]);

          // مسح النموذج
          setNewTimeSlot({ date: '', time: '', duration: 60 });

          // رسالة نجاح
          alert('تم إضافة الموعد بنجاح وحفظه في قاعدة البيانات');

          // إعادة تحميل البيانات للتأكد من الحفظ
          console.log('Reloading dashboard data to verify save...');
          // لا نحتاج لإعادة تحميل كامل - الموعد تم إضافته بالفعل للقائمة
        } else {
          throw new Error('فشل في حفظ الموعد في قاعدة البيانات');
        }

      } catch (error) {
        console.error('=== DASHBOARD ERROR ===');
        console.error('Error adding time slot:', error);
        console.error('Error details:', error.response?.data);
        console.error('=== END DASHBOARD ERROR ===');

        let errorMessage = 'حدث خطأ في إضافة الموعد';
        if (error.response?.status === 401) {
          errorMessage = 'يجب تسجيل الدخول أولاً';
        } else if (error.response?.status === 403) {
          errorMessage = 'ليس لديك صلاحية لإضافة المواعيد';
        } else if (error.message) {
          errorMessage = error.message;
        }

        alert(errorMessage);
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
            <h2 className="text-2xl font-bold text-[#6D552C]">
              {isShopOwner ? 'Manage Available Times' : 'My Booked Appointments'}
            </h2>
            <p className="text-[#8A6C37]">
              {isShopOwner ? 'Manage available times for booking' : 'Your booked appointments in shops'}
            </p>
          </div>
        </div>

        {/* Add new appointment - for owners only */}
        {isShopOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Add Available Time</CardTitle>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C37C00]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C37C00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدة (دقيقة)
                  </label>
                  <select
                    value={newTimeSlot.duration}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C37C00]"
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
                    className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white"
                  >
                    {isAdding ? 'جاري الإضافة...' : 'إضافة موعد'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appointments list */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isShopOwner ? `Available Times (${availableTimes.length})` : `My Booked Appointments (${availableTimes.length})`}
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
                            <Store className="w-4 h-4 text-[#8A6C37]" />
                            <span className="font-medium">{timeSlot.shop?.name || 'متجر غير محدد'}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Calendar className="w-4 h-4 text-[#8A6C37]" />
                          <span className="font-medium">{timeSlot.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Clock className="w-4 h-4 text-[#8A6C37]" />
                          <span>{timeSlot.time}</span>
                        </div>
                        <div className="text-sm text-[#92723A]">
                          ({timeSlot.duration} دقيقة)
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${isShopOwner
                          ? (timeSlot.isBooked ? 'text-red-600 bg-red-100' : 'text-[#6D552C] bg-[#D3BB92]')
                          : 'text-[#8A6C37] bg-[#E2D2B6]'
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
              <div className="text-center py-8 text-[#92723A]">
                <Clock className="w-12 h-12 mx-auto mb-4 text-[#D3BB92]" />
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
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    // { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'bookings', label: isShopOwner ? 'Bookings Overview' : 'My Bookings', icon: Calendar },
    { id: 'available-times', label: isShopOwner ? 'Time Management' : 'My Appointments', icon: Clock },
    ...(isShopOwner ? [
      { id: 'shop', label: 'Manage Shop', icon: Store }
    ] : [])
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB] flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#C37C00]" />
          <p className="text-[#A66A00]">Loading data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#A37F41] hover:bg-[#8A6C37] text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show access denied message for regular users
  if (isRegularUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-[#F0E8DB] to-[#E2D2B6] flex items-center justify-center" dir="ltr">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-3xl font-bold text-[#8A5700] mb-4">Access Denied</h1>
          <p className="text-lg text-[#A66A00] mb-8">
            Dashboard access is restricted to shop owners and administrators only.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3 rounded-full font-semibold"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] pt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#8A5700]">
            Welcome, {user?.firstName || 'User'}
          </h1>
          <p className="text-[#A66A00] mt-1">
            Manage your account and track your activities
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
                      ? 'border-[#C37C00] text-[#C37C00]'
                      : 'border-transparent text-[#A66A00] hover:text-[#8A5700] hover:border-[#FFDB99]'
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
          {/* {activeTab === 'favorites' && <FavoritesTab />} */}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'shop' && isShopOwner && <ShopOwnerTab />}
          {activeTab === 'available-times' && <AvailableTimesTab />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
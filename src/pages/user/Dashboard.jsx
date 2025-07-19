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
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import dashboardService from '../../services/dashboardService.js';
import ManageRatings from '../seller/ManageRatings.jsx';

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
    customers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);

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
          setStats(prev => ({ ...prev, ...shopStats.data }));
          setRecentActivity(shopActivity.data || []);
        } else {
          const userStats = await dashboardService.getUserStats();
          const userActivity = await dashboardService.getUserActivity();
          setStats(prev => ({ ...prev, ...userStats.data }));
          setRecentActivity(userActivity.data || []);
        }

        const bookingsData = await dashboardService.getBookings();
        setBookings(bookingsData.data || []);

        if (isShopOwner) {
          const response = await dashboardService.getAvailableTimes();
          setAvailableTimes(response.data || Array.isArray(response) ? response : []);
        } else {
          const response = await dashboardService.getUserBookings();
          setAvailableTimes(response.data || Array.isArray(response) ? response : []);
        }
      } catch (err) {
        setError(err.message || 'Error loading data');
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
      alert('Booking cancelled successfully');
    } catch (err) {
      setError(err.message || 'Error cancelling booking');
    }
  };

  const handleRemoveFromFavorites = async (favoriteId) => {
    try {
      await dashboardService.removeFromFavorites(favoriteId);
      const favoritesData = await dashboardService.getFavorites();
      setFavorites(favoritesData.data || []);
      alert('Item removed from favorites');
    } catch (err) {
      setError(err.message || 'Error removing item from favorites');
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
      <Card className="hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-md rounded-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#8A5700]">{title}</p>
              <p className="text-2xl font-bold text-[#C37C00]">{value}</p>
              {description && <p className="text-xs text-[#A66A00] mt-1">{description}</p>}
            </div>
            <div className={`w-10 h-10 ${colorClasses.bg} rounded-full flex items-center justify-center shadow-md`}>
              <IconComponent className={`w-5 h-5 ${colorClasses.text}`} />
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
    <Card className="hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-md rounded-lg">
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
    <Card className="hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-md rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-[#6D552C]">{booking.shop?.name || booking.shopName || 'Unknown Shop'}</h4>
            <div className="flex items-center space-x-2 text-sm text-[#8A6C37] mt-1">
              <Calendar className="w-4 h-4" />
              <span>{booking.date || booking.appointmentDate || 'Unknown Date'}</span>
              <Clock className="w-4 h-4" />
              <span>{booking.time || booking.appointmentTime || 'Unknown Time'}</span>
            </div>
            <p className="text-xs text-[#92723A] mt-1">{booking.type || booking.serviceType || 'General Service'}</p>
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
                ? 'Confirmed'
                : booking.status === 'approved'
                  ? 'Approved'
                  : booking.status === 'pending'
                    ? 'Pending'
                    : booking.status === 'cancelled'
                      ? 'Cancelled'
                      : booking.status || 'Unknown'}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} title="Bookings" value={stats.bookings} description={`${stats.activeBookings || 0} active bookings`} color="blue" />
        <StatCard icon={Star} title="Reviews" value={stats.reviews} description="Reviews written" color="green" />
        {isShopOwner && (
          <>
            <StatCard icon={Store} title="Shops" value={stats.shops} description="Registered shops" color="purple" />
            <StatCard icon={Package} title="Products" value={stats.products} description="Displayed products" color="yellow" />
          </>
        )}
      </div>
      <Card className="bg-white/90 backdrop-blur-md rounded-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest activities and updates</CardDescription>
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
              <p>No recent activities</p>
              <p className="text-sm">Start browsing shops or booking appointments</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="bg-white/90 backdrop-blur-md rounded-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(ROUTES.SHOPS)}
              aria-label="Browse shops"
            >
              <ShoppingBag className="w-6 h-6 mb-2" />
              <span className="text-sm">Browse Shops</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => setActiveTab('bookings')}
              aria-label="Book an appointment"
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm">Book Appointment</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(ROUTES.PROFILE)}
              aria-label="View profile"
            >
              <User className="w-6 h-6 mb-2" />
              <span className="text-sm">Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BookingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#6D552C]">{isShopOwner ? 'Bookings Overview' : 'My Bookings'}</h2>
          <p className="text-[#8A6C37]">{isShopOwner ? 'Overview of your shop bookings' : 'Your booked appointments'}</p>
        </div>
        <div className="flex gap-2">
          {isShopOwner ? (
            <>
              <Button
                onClick={() => navigate(ROUTES.TIME_MANAGEMENT)}
                className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                aria-label="Manage time"
              >
                <Clock className="w-4 h-4 mr-2" />
                Manage Time
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.BOOKINGS_ONLY)}
                className="border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                aria-label="View bookings only"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Bookings Only
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate(ROUTES.SHOPS)}
              className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              aria-label="Book new appointment"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book New Appointment
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
            <h3 className="text-lg font-medium mb-2">No Bookings Found</h3>
            <p className="mb-4">Start by booking an appointment at a shop</p>
            <Button
              onClick={() => navigate(ROUTES.SHOPS)}
              className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              aria-label="Browse shops"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Shops
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const ShopOwnerTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Store} title="Shops" value={stats.shops} description="Active shops" color="purple" />
        <StatCard icon={Package} title="Products" value={stats.products} description="Displayed products" color="blue" />
        <StatCard icon={Users} title="Customers" value={stats.customers} description="Registered customers" color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-md rounded-lg">
          <CardHeader>
            <CardTitle>Shop Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(ROUTES.CREATE_SHOP)}
                aria-label="Add new shop"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Shop
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(ROUTES.MANAGE_SHOP)}
                aria-label="Manage existing shops"
              >
                <Edit className="w-4 h-4 mr-2" />
                Manage Existing Shops
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur-md rounded-lg">
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(ROUTES.CREATE_PRODUCT)}
                aria-label="Add new product"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
              <Button
                variant="outline"
                className="w-full border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(ROUTES.MANAGE_SHOP)}
                aria-label="Manage products"
              >
                <Package className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-md rounded-lg">
          <CardHeader>
            <CardTitle>Appointment Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(ROUTES.TIME_MANAGEMENT)}
                aria-label="Manage all appointments"
              >
                <Clock className="w-4 h-4 mr-2" />
                Manage All Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90 backdrop-blur-md rounded-lg">
          <CardHeader>
            <CardTitle>Appointment Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#A66A00]">Booked Appointments</span>
                <span className="font-semibold text-[#8A5700]">{stats.bookings || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#A66A00]">Available Appointments</span>
                <span className="font-semibold text-[#8A5700]">{stats.availableTimes || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#A66A00]">Total Appointments</span>
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
      duration: 60,
    });
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTimeSlot = async () => {
      if (!newTimeSlot.date || !newTimeSlot.time) {
        alert('Please fill all fields');
        return;
      }

      try {
        setIsAdding(true);
        if (!user || user.role !== 'seller') {
          alert('You must be a shop owner to add time slots');
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
          alert('Time slot added successfully');
        } else {
          throw new Error('Failed to save time slot');
        }
      } catch (error) {
        alert(error.message || 'Error adding time slot');
      } finally {
        setIsAdding(false);
      }
    };

    const handleDeleteTimeSlot = async (timeId) => {
      if (!confirm('Are you sure you want to delete this time slot?')) return;

      try {
        await dashboardService.deleteAvailableTime(timeId);
        setAvailableTimes(prev => prev.filter(time => time._id !== timeId));
        alert('Time slot deleted successfully');
      } catch (error) {
        alert(error.message || 'Error deleting time slot');
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
            <h2 className="text-2xl font-bold text-[#6D552C]">{isShopOwner ? 'Manage Available Times' : 'My Booked Appointments'}</h2>
            <p className="text-[#8A6C37]">{isShopOwner ? 'Manage time slots for bookings' : 'Your booked appointments in shops'}</p>
          </div>
        </div>
        {isShopOwner && (
          <Card className="bg-white/90 backdrop-blur-md rounded-lg">
            <CardHeader>
              <CardTitle>Add Available Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6D552C] mb-2">Date</label>
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
                  <label className="block text-sm font-medium text-[#6D552C] mb-2">Time</label>
                  <input
                    type="time"
                    value={newTimeSlot.time}
                    onChange={e => setNewTimeSlot(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C37C00] bg-white/80"
                    aria-label="Select time"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6D552C] mb-2">Duration (minutes)</label>
                  <select
                    value={newTimeSlot.duration}
                    onChange={e => setNewTimeSlot(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C37C00] bg-white/80"
                    aria-label="Select duration"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddTimeSlot}
                    disabled={isAdding}
                    className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    aria-label="Add time slot"
                  >
                    {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    {isAdding ? 'Adding...' : 'Add Time Slot'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="bg-white/90 backdrop-blur-md rounded-lg">
          <CardHeader>
            <CardTitle>{isShopOwner ? `Available Times (${availableTimes.length})` : `My Booked Appointments (${availableTimes.length})`}</CardTitle>
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
                            ? 'Booked'
                            : 'Available'
                          : timeSlot.status === 'confirmed'
                            ? 'Confirmed'
                            : timeSlot.status || 'Booked'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {isShopOwner && !timeSlot.isBooked && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTimeSlot(timeSlot._id)}
                          className="border-red-400 text-red-600 hover:bg-red-500 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
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
                          className="border-red-400 text-red-600 hover:bg-red-500 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                          aria-label="Cancel booking"
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#92723A] bg-white/80 rounded-lg">
                <Clock className="w-12 h-12 mx-auto mb-4 text-[#D3BB92]" />
                <p>{isShopOwner ? 'No available times' : 'No booked appointments'}</p>
                <p className="text-sm">{isShopOwner ? 'Add available times for customers to book' : 'Start booking appointments at shops'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: isShopOwner ? 'Bookings Overview' : 'My Bookings', icon: Calendar },
    { id: 'available-times', label: isShopOwner ? 'Time Management' : 'My Appointments', icon: Clock },
    ...(isShopOwner ? [
      { id: 'shop', label: 'Manage Shop', icon: Store },
      { id: 'ratings', label: 'Manage Ratings', icon: Star }
    ] : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#C37C00]" />
          <p className="text-[#A66A00]">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-red-600 mb-4 text-4xl">❌</div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
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
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] flex items-center justify-center pt-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-3xl font-bold text-[#8A5700] mb-4">Access Denied</h1>
          <p className="text-lg text-[#A66A00] mb-8">Dashboard access is restricted to shop owners and administrators only.</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            aria-label="Go to home"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] pt-20 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#8A5700]">Welcome, {user?.firstName || 'User'}</h1>
          <p className="text-[#A66A00] mt-1">Manage your account and track your activities</p>
        </div>
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md rounded-lg shadow-lg mb-6">
          <nav className="flex space-x-4 p-4 border-b border-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === tab.id
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
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'shop' && isShopOwner && <ShopOwnerTab />}
          {activeTab === 'ratings' && isShopOwner && <ManageRatings />}
          {activeTab === 'available-times' && <AvailableTimesTab />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
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
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus,
  Store,
  BarChart3,
  Users,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isShopOwner } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    favorites: 12,
    bookings: 5,
    reviews: 8,
    shops: isShopOwner ? 2 : 0,
    products: isShopOwner ? 45 : 0,
    customers: isShopOwner ? 156 : 0
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'حجز موعد في رويال جولد',
      date: '2024-01-15',
      status: 'confirmed'
    },
    {
      id: 2,
      type: 'favorite',
      title: 'أضفت خاتم ذهبي للمفضلة',
      date: '2024-01-14',
      status: 'active'
    },
    {
      id: 3,
      type: 'review',
      title: 'قيمت متجر مجوهرات الإسكندرية',
      date: '2024-01-13',
      status: 'completed'
    }
  ]);

  const [favorites, setFavorites] = useState([
    {
      id: 1,
      name: 'خاتم ذهبي كلاسيكي',
      shop: 'رويال جولد القاهرة',
      price: '2,500 جنيه',
      image: '/api/placeholder/150/150'
    },
    {
      id: 2,
      name: 'قلادة ماسية فاخرة',
      shop: 'مجوهرات الإسكندرية',
      price: '8,900 جنيه',
      image: '/api/placeholder/150/150'
    }
  ]);

  const [bookings, setBookings] = useState([
    {
      id: 1,
      shop: 'رويال جولد القاهرة',
      date: '2024-01-20',
      time: '2:00 PM',
      status: 'confirmed',
      type: 'consultation'
    },
    {
      id: 2,
      shop: 'كنوز الفراعنة',
      date: '2024-01-25',
      time: '11:00 AM',
      status: 'pending',
      type: 'viewing'
    }
  ]);

  const StatCard = ({ icon: Icon, title, value, description, color = 'yellow' }) => (
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
          <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
            <Button size="sm" variant="outline">
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
            <h4 className="font-medium text-gray-900">{booking.shop}</h4>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600 mt-1">
              <Calendar className="w-4 h-4" />
              <span>{booking.date}</span>
              <Clock className="w-4 h-4" />
              <span>{booking.time}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{booking.type}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              booking.status === 'confirmed' 
                ? 'text-green-600 bg-green-100' 
                : 'text-yellow-600 bg-yellow-100'
            }`}>
              {booking.status}
            </span>
            <div className="flex space-x-1">
              <Button size="sm" variant="outline">
                <Edit className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="w-3 h-3" />
              </Button>
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
          description="موعد نشط"
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
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
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
        {favorites.map((item) => (
          <FavoriteItem key={item.id} item={item} />
        ))}
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
        <Button onClick={() => navigate(ROUTES.BOOK_APPOINTMENT)}>
          <Plus className="w-4 h-4 mr-2" />
          حجز موعد جديد
        </Button>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <BookingItem key={booking.id} booking={booking} />
        ))}
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

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { id: 'favorites', label: 'المفضلة', icon: Heart },
    { id: 'bookings', label: 'المواعيد', icon: Calendar },
    ...(isShopOwner ? [{ id: 'shop', label: 'إدارة المتجر', icon: Store }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
                    className={`flex items-center space-x-2 rtl:space-x-reverse py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


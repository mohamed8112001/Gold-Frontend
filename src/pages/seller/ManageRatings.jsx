import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, MessageCircle, Bell, Eye, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { rateService } from '../../services/rateService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const ManageRatings = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, recent
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    unreadNotifications: 0,
    recentRatings: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch ratings for shop owner's shops
      const ratingsResponse = await rateService.getAllRates();
      console.log(ratingsResponse)
      const allRatings = ratingsResponse.data || [];

      // Filter ratings for current user's shops (if user is shop owner)
      // Note: This assumes the API returns shop owner info or we need to modify the API
      setRatings(allRatings);

      // Fetch notifications
      const notificationsResponse = await notificationService.getNotifications({
        unreadOnly: false,
        limit: 50
      });
      const ratingNotifications = notificationsResponse.data.notifications.filter(
        notif => notif.type === 'rating'
      );
      setNotifications(ratingNotifications);

      // Calculate stats
      const totalRatings = allRatings.length;
      const averageRating = totalRatings > 0
        ? allRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
        : 0;
      const unreadNotifications = notificationsResponse.data.unreadCount || 0;
      const recentRatings = allRatings.filter(rating => {
        const ratingDate = new Date(rating.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return ratingDate > weekAgo;
      }).length;

      setStats({
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        unreadNotifications,
        recentRatings
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      );
      setStats(prev => ({ ...prev, unreadNotifications: prev.unreadNotifications - 1 }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating
            ? 'fill-[#C37C00] text-[#C37C00]'
            : 'text-gray-300'
          }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredData = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(notif => !notif.read);
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return ratings.filter(rating => new Date(rating.createdAt) > weekAgo);
      default:
        return ratings;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة التقييمات</h1>
          <p className="text-gray-600 mt-2">تابع وأدر تقييمات عملائك</p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          className="flex items-center gap-2"
        >
          {/* <Eye className="w-4 h-4" /> */}
          تحديث البيانات
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي التقييمات</p>
                <p className="text-2xl font-bold text-[#C37C00]">{stats.totalRatings}</p>
              </div>
              <Star className="w-8 h-8 text-[#C37C00]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التقييم</p>
                <p className="text-2xl font-bold text-[#C37C00]">{stats.averageRating}/5</p>
              </div>
              <div className="flex">
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إشعارات غير مقروءة</p>
                <p className="text-2xl font-bold text-red-600">{stats.unreadNotifications}</p>
              </div>
              <Bell className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تقييمات هذا الأسبوع</p>
                <p className="text-2xl font-bold text-green-600">{stats.recentRatings}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          جميع التقييمات
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          className="flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          غير مقروءة ({notifications.filter(n => !n.read).length})
        </Button>
        <Button
          variant={filter === 'recent' ? 'default' : 'outline'}
          onClick={() => setFilter('recent')}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          حديثة ({stats.recentRatings})
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {filter === 'unread' ? (
          // Show notifications
          notifications.filter(notif => !notif.read).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد إشعارات غير مقروءة</p>
              </CardContent>
            </Card>
          ) : (
            notifications.filter(notif => !notif.read).map((notification) => (
              <Card key={notification._id} className="border-l-4 border-l-[#C37C00]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">إشعار جديد</Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      {notification.data?.comment && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          "{notification.data.comment}"
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => markNotificationAsRead(notification._id)}
                    >
                      تم القراءة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : (
          // Show ratings
          getFilteredData().length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد تقييمات</p>
              </CardContent>
            </Card>
          ) : (
            getFilteredData().map((rating) => (
              <Card key={rating._id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center text-white font-semibold">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {rating.user?.name || 'مستخدم'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {renderStars(rating.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {rating.rating}/5
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(rating.createdAt)}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700 leading-relaxed">
                          {rating.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default ManageRatings;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { bookingService } from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const ManageBookings = () => {
  const navigate = useNavigate();
  const { user, isShopOwner } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    if (!user || !isShopOwner) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadBookings();
    loadAvailableTimes();
  }, [user, isShopOwner, navigate]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      // This would need to be implemented in the backend
      // const response = await bookingService.getShopBookings(user.shopId);
      // setBookings(response.data || response);
      
      // Using mock data for demo
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings(mockBookings);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableTimes = async () => {
    try {
      // This would get available times for the shop owner's shop
      // const response = await bookingService.getAvailableTimesForShop(user.shopId);
      // setAvailableTimes(response.data || response);
      
      // Using mock data for demo
      setAvailableTimes(mockAvailableTimes);
    } catch (error) {
      console.error('Error loading available times:', error);
      setAvailableTimes(mockAvailableTimes);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      // This would need to be implemented in the backend
      // await bookingService.updateBookingStatus(bookingId, status);
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status }
          : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleAddAvailableTime = async (timeData) => {
    try {
      await bookingService.addAvailableTime(timeData);
      loadAvailableTimes();
    } catch (error) {
      console.error('Error adding available time:', error);
    }
  };

  // Mock data for demo
  const mockBookings = [
    {
      id: 1,
      customerName: 'أحمد محمد',
      customerPhone: '+20 100 123 4567',
      customerEmail: 'ahmed@example.com',
      date: '2024-01-20',
      time: '14:00',
      status: 'pending',
      notes: 'أريد رؤية خواتم الخطوبة',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      customerName: 'فاطمة علي',
      customerPhone: '+20 101 234 5678',
      customerEmail: 'fatma@example.com',
      date: '2024-01-21',
      time: '16:30',
      status: 'confirmed',
      notes: 'مهتمة بالسلاسل الذهبية',
      createdAt: '2024-01-16'
    },
    {
      id: 3,
      customerName: 'محمود حسن',
      customerPhone: '+20 102 345 6789',
      customerEmail: 'mahmoud@example.com',
      date: '2024-01-19',
      time: '11:00',
      status: 'completed',
      notes: 'شراء أسورة ذهبية',
      createdAt: '2024-01-14'
    }
  ];

  const mockAvailableTimes = [
    {
      id: 1,
      date: '2024-01-22',
      time: '10:00',
      isBooked: false
    },
    {
      id: 2,
      date: '2024-01-22',
      time: '14:00',
      isBooked: true
    },
    {
      id: 3,
      date: '2024-01-23',
      time: '11:00',
      isBooked: false
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'في الانتظار', variant: 'secondary', icon: AlertCircle },
      confirmed: { label: 'مؤكد', variant: 'default', icon: CheckCircle },
      completed: { label: 'مكتمل', variant: 'success', icon: CheckCircle },
      cancelled: { label: 'ملغي', variant: 'destructive', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const BookingCard = ({ booking }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{booking.customerName}</CardTitle>
            <CardDescription>
              {new Date(booking.date).toLocaleDateString('ar-EG')} في {booking.time}
            </CardDescription>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{booking.customerPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{booking.customerEmail}</span>
          </div>
        </div>
        
        {booking.notes && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">ملاحظات:</p>
            <p className="text-sm text-gray-600">{booking.notes}</p>
          </div>
        )}

        {booking.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
            >
              تأكيد الموعد
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
            >
              إلغاء الموعد
            </Button>
          </div>
        )}

        {booking.status === 'confirmed' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
            >
              تم الانتهاء
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
            >
              إلغاء الموعد
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المواعيد...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">إدارة المواعيد</h1>
          <p className="text-gray-600">إدارة مواعيد العملاء والأوقات المتاحة</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookings">المواعيد ({bookings.length})</TabsTrigger>
            <TabsTrigger value="times">الأوقات المتاحة ({availableTimes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            {bookings.length > 0 ? (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  لا توجد مواعيد
                </h3>
                <p className="text-gray-600">
                  لم يتم حجز أي مواعيد بعد
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="times" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">الأوقات المتاحة</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                إضافة وقت متاح
              </Button>
            </div>

            {availableTimes.length > 0 ? (
              <div className="grid gap-4">
                {availableTimes.map((timeSlot) => (
                  <Card key={timeSlot.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {new Date(timeSlot.date).toLocaleDateString('ar-EG')}
                          </p>
                          <p className="text-sm text-gray-600">{timeSlot.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={timeSlot.isBooked ? 'destructive' : 'success'}>
                          {timeSlot.isBooked ? 'محجوز' : 'متاح'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  لا توجد أوقات متاحة
                </h3>
                <p className="text-gray-600 mb-4">
                  ابدأ بإضافة الأوقات المتاحة للحجز
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة وقت متاح
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageBookings;

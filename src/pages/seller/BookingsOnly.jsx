import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';
import { bookingService } from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const BookingsOnly = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getShopBookings();
      // Filter only booked appointments
      const bookedOnly = (response.data || []).filter(booking => booking.isBooked);
      setBookings(bookedOnly);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAppointmentTypeLabel = (type) => {
    const types = {
      consultation: 'استشارة',
      viewing: 'معاينة',
      purchase: 'شراء',
      repair: 'إصلاح'
    };
    return types[type] || 'استشارة';
  };

  const getAppointmentTypeColor = (type) => {
    const colors = {
      consultation: 'bg-blue-100 text-blue-800 border-blue-200',
      viewing: 'bg-green-100 text-green-800 border-green-200',
      purchase: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      repair: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type] || 'bg-blue-100 text-blue-800 border-blue-200';
  };

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm ||
      (booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = !filterDate ||
      new Date(booking.date).toISOString().split('T')[0] === filterDate;

    const matchesType = filterType === 'all' || booking.appointmentType === filterType;

    return matchesSearch && matchesDate && matchesType;
  });

  // Group bookings by date
  const groupedBookings = filteredBookings.reduce((groups, booking) => {
    const date = new Date(booking.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(booking);
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedBookings).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">المواعيد المحجوزة</h1>
              <p className="text-gray-600 mt-2">عرض وإدارة جميع المواعيد المحجوزة من العملاء</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 text-lg">
                {bookings.length} موعد محجوز
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-yellow-200">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث بالاسم أو البريد الإلكتروني
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="ابحث عن عميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تصفية بالتاريخ
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-csk-400 focus:border-csk-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الموعد
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-csk-400 focus:border-csk-400"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="consultation">استشارة</option>
                  <option value="viewing">معاينة</option>
                  <option value="purchase">شراء</option>
                  <option value="repair">إصلاح</option>
                </select>
              </div>
            </div>
            {(searchTerm || filterDate || filterType !== 'all') && (
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterDate('');
                    setFilterType('all');
                  }}
                  className="text-gray-600 border-gray-300"
                >
                  مسح الفلاتر
                </Button>
                <span className="text-sm text-gray-600">
                  عرض {filteredBookings.length} من {bookings.length} موعد
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المواعيد</p>
                  <p className="text-3xl font-bold text-green-600">{bookings.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">استشارات</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {bookings.filter(b => b.appointmentType === 'consultation').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">مشتريات</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {bookings.filter(b => b.appointmentType === 'purchase').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">معاينات</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {bookings.filter(b => b.appointmentType === 'viewing').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-csk-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <XCircle size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {bookings.length === 0 ? 'لا توجد مواعيد محجوزة' : 'لا توجد نتائج'}
                </h3>
                <p className="text-gray-600">
                  {bookings.length === 0
                    ? 'ستظهر هنا المواعيد التي يحجزها العملاء'
                    : 'جرب تغيير معايير البحث أو الفلتر'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(date => (
              <Card key={date} className="border-csk-200">
                <CardHeader className="bg-gradient-csk-light">
                  <CardTitle className="text-csk-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {formatDate(date)} ({groupedBookings[date].length} موعد)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {groupedBookings[date]
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((booking) => (
                        <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-2 text-csk-600">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-medium">{formatTime(booking.time)}</span>
                                </div>
                                <Badge className={getAppointmentTypeColor(booking.appointmentType)}>
                                  {getAppointmentTypeLabel(booking.appointmentType)}
                                </Badge>
                              </div>

                              {booking.user && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span>{booking.user.name || 'غير محدد'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span>{booking.user.email}</span>
                                  </div>
                                  {booking.user.phone && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                      <Phone className="w-4 h-4 text-gray-500" />
                                      <span>{booking.user.phone}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {booking.notes && (
                                <div className="bg-gray-50 p-3 rounded-md">
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-1">ملاحظات العميل:</p>
                                      <p className="text-sm text-gray-600">{booking.notes}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsOnly;

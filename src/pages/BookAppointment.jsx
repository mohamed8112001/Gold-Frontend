import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { shopService } from '../services/shopService';
import { useAuth } from '../context/AuthContext';

const BookAppointment = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [shop, setShop] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    notes: '',
    appointmentType: 'consultation'
  });

  useEffect(() => {
    loadShopData();
  }, [shopId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimes();
    }
  }, [selectedDate]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      const response = await shopService.getShopById(shopId);
      setShop(response.data);
    } catch (error) {
      console.error('Error loading shop:', error);
      alert('حدث خطأ في تحميل بيانات المتجر');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTimes = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getAvailableTimesForShop(shopId, selectedDate);
      setAvailableTimes(response.data || []);
    } catch (error) {
      console.error('Error loading available times:', error);
      alert('حدث خطأ في تحميل المواعيد المتاحة');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      alert('يرجى تسجيل الدخول أولاً');
      navigate('/auth/login');
      return;
    }

    if (!selectedTime) {
      alert('يرجى اختيار موعد');
      return;
    }

    try {
      setLoading(true);
      await bookingService.bookTime({
        timeId: selectedTime._id,
        notes: bookingData.notes,
        appointmentType: bookingData.appointmentType
      });

      alert('تم حجز الموعد بنجاح! سيتم التواصل معك قريباً');
      navigate('/profile/bookings');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('حدث خطأ في حجز الموعد: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading && !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} />
            العودة
          </button>

          {shop && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                حجز موعد في {shop.name}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={18} />
                  <span>{shop.phone}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Date Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">اختر التاريخ</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {selectedDate && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar size={18} />
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">اختر الوقت</h2>

            {!selectedDate ? (
              <p className="text-gray-500 text-center py-8">يرجى اختيار التاريخ أولاً</p>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">جاري تحميل المواعيد...</p>
              </div>
            ) : availableTimes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد مواعيد متاحة في هذا التاريخ</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableTimes.map((time) => (
                  <button
                    key={time._id}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedTime?._id === time._id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Clock size={16} />
                      <span className="font-medium">{formatTime(time.time)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Details */}
        {selectedTime && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">تفاصيل الموعد</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الموعد
                </label>
                <select
                  value={bookingData.appointmentType}
                  onChange={(e) => setBookingData({ ...bookingData, appointmentType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consultation">استشارة</option>
                  <option value="viewing">مشاهدة منتجات</option>
                  <option value="purchase">شراء</option>
                  <option value="repair">إصلاح</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  placeholder="أي ملاحظات أو طلبات خاصة..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">ملخص الموعد:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">المتجر:</span> {shop?.name}</p>
                <p><span className="font-medium">التاريخ:</span> {formatDate(selectedDate)}</p>
                <p><span className="font-medium">الوقت:</span> {formatTime(selectedTime.time)}</p>
                <p><span className="font-medium">نوع الموعد:</span> {
                  bookingData.appointmentType === 'consultation' ? 'استشارة' :
                    bookingData.appointmentType === 'viewing' ? 'مشاهدة منتجات' :
                      bookingData.appointmentType === 'purchase' ? 'شراء' : 'إصلاح'
                }</p>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الحجز...' : 'تأكيد الحجز'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;

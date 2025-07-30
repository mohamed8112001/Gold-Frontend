import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Store, ArrowRight } from 'lucide-react'; // استخدم سهم لليمين بدل اليسار
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { shopService } from '../../services/shopService';

const BookAppointment = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shop, setShop] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [shopId, user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const shopResponse = await shopService.getShop(shopId);
      const shopData = shopResponse.data || shopResponse;
      setShop(shopData);

      const isShopOwner = shopData.owner === user.id ||
        shopData.owner?._id === user.id ||
        shopData.ownerId === user.id ||
        shopData.userId === user.id;

      const timesResponse = await dashboardService.getShopAvailableTimes(shopId);
      if (timesResponse && timesResponse.data) {
        setAvailableTimes(timesResponse.data);
      } else if (Array.isArray(timesResponse)) {
        setAvailableTimes(timesResponse);
      } else {
        setAvailableTimes([]);
      }

    } catch (error) {
      setError(error.message || 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTime = async (timeSlot) => {
    if (!confirm('هل ترغب في حجز هذا الموعد؟')) return;

    try {
      setBooking(true);
      const bookingData = {
        timeId: timeSlot._id,
        shopId: shopId,
        date: timeSlot.date,
        time: timeSlot.time,
        duration: timeSlot.duration
      };
      await dashboardService.bookAvailableTime(bookingData);
      alert('تم حجز الموعد بنجاح! يمكنك عرضه من لوحة التحكم.');
      navigate('/dashboard');

    } catch (error) {
      alert(error.message || 'حدث خطأ أثناء الحجز');
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] pt-20" dir="rtl">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center mx-auto mb-6 ">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">جاري تحميل المواعيد</h2>
            <p className="text-gray-600">يرجى الانتظار بينما نقوم بتحميل مواعيد الحجز المتاحة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20" dir="rtl">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl  p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              العودة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-1 to-primary-2 py-8 pt-20 font-cairo" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            رجوع
          </Button>

          <div className="bg-white rounded-lg p-6 border border-secondary-2 shadow-sm">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Store className="w-8 h-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-primary-900 font-cairo">
                  احجز موعد في {shop?.name || 'المحل'}
                </h1>
                <p className="text-secondary-800 font-cairo">
                  اختر الوقت المناسب من المواعيد المتاحة
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Calendar className="w-5 h-5" />
              <span>المواعيد المتاحة ({availableTimes.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableTimes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTimes.map((timeSlot) => (
                  <div
                    key={timeSlot._id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover: transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {formatDate(timeSlot.date)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{timeSlot.time}</span>
                        <span className="text-sm text-gray-500">
                          ({timeSlot.duration} دقيقة)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${timeSlot.isBooked
                          ? 'text-red-600 bg-red-100'
                          : 'text-[#8A5700] bg-[#FFF0CC]'
                          }`}>
                          {timeSlot.isBooked ? 'محجوز' : 'متاح'}
                        </span>

                        {!timeSlot.isBooked && (
                          <Button
                            size="sm"
                            onClick={() => handleBookTime(timeSlot)}
                            disabled={booking}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            {booking ? 'جارٍ الحجز...' : 'احجز الآن'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">لا توجد مواعيد متاحة</h3>
                <p className="mb-4">لا توجد مواعيد متاحة في هذا المحل حاليًا</p>
                <Button onClick={() => navigate(-1)}>الرجوع إلى المحل</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;

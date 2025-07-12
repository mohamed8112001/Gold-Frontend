import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Store, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Layout from '../../components/layout/Layout';
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

      // Load shop details
      const shopResponse = await shopService.getShopById(shopId);
      console.log('Shop details:', shopResponse);
      setShop(shopResponse.data || shopResponse);

      // Load available times for this shop
      const timesResponse = await dashboardService.getShopAvailableTimes(shopId);
      console.log('Available times:', timesResponse);

      if (timesResponse && timesResponse.data) {
        setAvailableTimes(timesResponse.data);
      } else if (Array.isArray(timesResponse)) {
        setAvailableTimes(timesResponse);
      } else {
        setAvailableTimes([]);
      }

    } catch (error) {
      console.error('Error loading booking data:', error);
      setError(error.message || 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTime = async (timeSlot) => {
    if (!confirm('هل تريد حجز هذا الموعد؟')) return;

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

      alert('تم حجز الموعد بنجاح! يمكنك مراجعته في الداشبورد');
      navigate('/dashboard');

    } catch (error) {
      console.error('Error booking appointment:', error);
      alert(error.message || 'حدث خطأ في حجز الموعد');
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
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل المواعيد المتاحة...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>العودة</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Store className="w-8 h-8 text-yellow-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    حجز موعد في {shop?.name || 'المتجر'}
                  </h1>
                  <p className="text-gray-600">
                    اختر الموعد المناسب لك من المواعيد المتاحة
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Available Times */}
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
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
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
                            : 'text-green-600 bg-green-100'
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
                              {booking ? 'جاري الحجز...' : 'احجز الآن'}
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
                  <p className="mb-4">لا توجد مواعيد متاحة للحجز في هذا المتجر حالياً</p>
                  <Button onClick={() => navigate(-1)}>العودة للمتجر</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookAppointment;

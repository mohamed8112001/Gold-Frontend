import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Store, ArrowLeft } from 'lucide-react';
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

      // Load shop details
      const shopResponse = await shopService.getShop(shopId);
      console.log('Shop details:', shopResponse);
      const shopData = shopResponse.data || shopResponse;
      setShop(shopData);

      // Check if current user is the shop owner
      const isShopOwner = shopData.owner === user.id ||
        shopData.owner?._id === user.id ||
        shopData.ownerId === user.id ||
        shopData.userId === user.id;

      console.log('🔍 Shop owner check:', {
        shopOwner: shopData.owner,
        shopOwnerId: shopData.ownerId,
        shopUserId: shopData.userId,
        currentUserId: user.id,
        isShopOwner
      });

      // Temporarily disabled for testing - shop owners can book appointments
      if (isShopOwner) {
        console.log('⚠️ Shop owner trying to book appointment in their own shop - ALLOWING FOR TESTING');
        // setError('You cannot book appointments in your own shop. Please go to your dashboard to manage appointments.');
        // return;
      }

      // Load available times for this shop
      const timesResponse = await dashboardService.getShopAvailableTimes(shopId);
      console.log('📅 Available times response:', timesResponse);
      console.log('📅 Available times response type:', typeof timesResponse);
      console.log('📅 Available times response.data:', timesResponse?.data);

      if (timesResponse && timesResponse.data) {
        console.log('📅 Setting available times from response.data:', timesResponse.data);
        setAvailableTimes(timesResponse.data);
      } else if (Array.isArray(timesResponse)) {
        console.log('📅 Setting available times from response array:', timesResponse);
        setAvailableTimes(timesResponse);
      } else {
        console.log('📅 No available times found, setting empty array');
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
    if (!confirm('Do you want to book this appointment?')) return;

    try {
      setBooking(true);

      const bookingData = {
        timeId: timeSlot._id,
        shopId: shopId,
        date: timeSlot.date,
        time: timeSlot.time,
        duration: timeSlot.duration
      };

      console.log('🔄 Booking data being sent:', bookingData);
      console.log('🔄 Time slot details:', timeSlot);
      console.log('🔄 Shop ID:', shopId);

      const response = await dashboardService.bookAvailableTime(bookingData);
      console.log('✅ Booking response:', response);

      alert('Appointment booked successfully! You can view it in your dashboard.');
      navigate('/dashboard');

    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(error.message || 'Error occurred while booking appointment');
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
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center mx-auto mb-6 ">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Appointments</h2>
            <p className="text-gray-600">Please wait while we load available appointment times...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Special handling for shop owner error
    if (error.includes('cannot book appointments in your own shop')) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] pt-20">
          <div className="max-w-2xl mx-auto px-4 py-16">
            <Card className=" border-0 bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white text-center py-8">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl font-bold">Shop Owner Access</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      You Own This Shop!
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      As the owner of <strong>{shop?.name}</strong>, you cannot book appointments in your own shop.
                      Instead, you can manage your shop's appointments and available times from your dashboard.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] rounded-xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">What you can do:</h3>
                    <ul className="text-left space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                        Manage your shop's available appointment times
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                        View and manage customer bookings
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                        Update your shop information and products
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/shops')}
                      className="border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white px-6 py-3 rounded-xl font-semibold"
                    >
                      Browse Other Shops
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Regular error display
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl  p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-1 to-primary-2 py-8 pt-20 font-cairo">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="bg-white rounded-lg p-6 border border-secondary-2 shadow-sm">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Store className="w-8 h-8 text-primary-500" />
              <div>
                <h1 className="text-2xl font-bold text-primary-900 font-cairo">
                  Book Appointment at {shop?.name || 'Shop'}
                </h1>
                <p className="text-secondary-800 font-cairo">
                  Choose a suitable appointment time from available slots
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
              <span>Available Appointments ({availableTimes.length})</span>
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
                          ({timeSlot.duration} minutes)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${timeSlot.isBooked
                          ? 'text-red-600 bg-red-100'
                          : 'text-[#8A5700] bg-[#FFF0CC]'
                          }`}>
                          {timeSlot.isBooked ? 'Booked' : 'Available'}
                        </span>

                        {!timeSlot.isBooked && (
                          <Button
                            size="sm"
                            onClick={() => handleBookTime(timeSlot)}
                            disabled={booking}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            {booking ? 'Booking...' : 'Book Now'}
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
                <h3 className="text-lg font-medium mb-2">No Available Appointments</h3>
                <p className="mb-4">There are currently no available appointment slots at this shop</p>
                <Button onClick={() => navigate(-1)}>Back to Shop</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  User, 
  CheckCircle,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import { bookingService } from '../../services/bookingService.js';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [notes, setNotes] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shopId) {
      loadShopDetails(shopId);
    }
  }, [shopId]);

  useEffect(() => {
    if (selectedDate && selectedShop) {
      loadAvailableTimes();
    }
  }, [selectedDate, selectedShop]);

  const loadShopDetails = async (id) => {
    try {
      // Mock shop data for demo
      const shop = {
        id: id,
        name: 'Royal Gold Cairo',
        nameAr: 'رويال جولد القاهرة',
        location: 'Downtown, Cairo',
        locationAr: 'وسط البلد، القاهرة',
        phone: '+20 2 1234567',
        rating: 4.8,
        reviewCount: 156,
        openingHours: '9:00 AM - 10:00 PM',
        description: 'متجر مجوهرات راقي يقدم أفضل التصاميم الذهبية والماسية'
      };
      setSelectedShop(shop);
    } catch (error) {
      setError('خطأ في تحميل بيانات المتجر');
    }
  };

  const loadAvailableTimes = async () => {
    try {
      setIsLoading(true);
      const times = await bookingService.getAvailableTimesForShop(selectedShop.id, selectedDate);
      setAvailableTimes(times);
    } catch (error) {
      // Mock available times for demo
      setAvailableTimes([
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const bookingData = {
        shopId: selectedShop.id,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        notes: notes
      };

      await bookingService.bookTime(bookingData);
      setStep(4); // Success step
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء حجز الموعد');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const appointmentTypes = [
    { id: 'consultation', label: 'استشارة', description: 'استشارة حول المجوهرات والتصاميم' },
    { id: 'viewing', label: 'معاينة', description: 'معاينة قطع محددة' },
    { id: 'custom_design', label: 'تصميم مخصص', description: 'مناقشة تصميم مخصص' },
    { id: 'repair', label: 'إصلاح', description: 'خدمات الإصلاح والصيانة' }
  ];

  // Step 1: Shop Selection (if no shopId provided)
  const ShopSelectionStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>اختيار المتجر</CardTitle>
        <CardDescription>اختر المتجر الذي تريد حجز موعد فيه</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => navigate(ROUTES.SHOPS)}
          className="w-full"
        >
          تصفح المتاجر
        </Button>
      </CardContent>
    </Card>
  );

  // Step 2: Date and Time Selection
  const DateTimeSelectionStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>اختيار التاريخ والوقت</CardTitle>
          <CardDescription>اختر التاريخ والوقت المناسب لموعدك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاريخ
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full"
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوقت المتاح
              </label>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">جاري تحميل الأوقات المتاحة...</p>
                </div>
              ) : availableTimes.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                      className="h-12"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">لا توجد أوقات متاحة في هذا التاريخ</p>
                  <p className="text-sm text-gray-500">جرب تاريخاً آخر</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Step 3: Appointment Details
  const AppointmentDetailsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الموعد</CardTitle>
          <CardDescription>أضف تفاصيل إضافية لموعدك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Appointment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              نوع الموعد
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointmentTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all ${
                    appointmentType === type.id
                      ? 'ring-2 ring-yellow-500 bg-yellow-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setAppointmentType(type.id)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900">{type.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف أي ملاحظات أو متطلبات خاصة..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              rows={4}
            />
          </div>

          {/* Booking Summary */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">ملخص الحجز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">المتجر:</span>
                  <span className="font-medium">{selectedShop?.nameAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوقت:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                {appointmentType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">نوع الموعد:</span>
                    <span className="font-medium">
                      {appointmentTypes.find(t => t.id === appointmentType)?.label}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Step 4: Success
  const SuccessStep = () => (
    <Card className="text-center">
      <CardContent className="p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          تم حجز الموعد بنجاح!
        </h2>
        <p className="text-gray-600 mb-6">
          سيتم التواصل معك قريباً لتأكيد الموعد
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">تفاصيل الموعد</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>المتجر:</span>
              <span>{selectedShop?.nameAr}</span>
            </div>
            <div className="flex justify-between">
              <span>التاريخ:</span>
              <span>{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>الوقت:</span>
              <span>{selectedTime}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full"
          >
            عرض مواعيدي
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate(ROUTES.SHOPS)}
            className="w-full"
          >
            تصفح متاجر أخرى
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const canProceedToNext = () => {
    switch (step) {
      case 1:
        return selectedShop;
      case 2:
        return selectedDate && selectedTime;
      case 3:
        return appointmentType;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">حجز موعد</h1>
          <p className="text-gray-600 mt-1">احجز موعدك في أفضل متاجر المجوهرات</p>
        </div>

        {/* Progress Steps */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-yellow-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>اختيار المتجر</span>
              <span>التاريخ والوقت</span>
              <span>تفاصيل الموعد</span>
            </div>
          </div>
        )}

        {/* Shop Info (if selected) */}
        {selectedShop && step > 1 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <div className="text-2xl">🏪</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{selectedShop.nameAr}</h3>
                  <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 mt-1">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{selectedShop.locationAr}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      <span>{selectedShop.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      <span>{selectedShop.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        <div>
          {!selectedShop && step === 1 && <ShopSelectionStep />}
          {selectedShop && step === 1 && setStep(2)}
          {step === 2 && <DateTimeSelectionStep />}
          {step === 3 && <AppointmentDetailsStep />}
          {step === 4 && <SuccessStep />}
        </div>

        {/* Navigation Buttons */}
        {step < 4 && step > 1 && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              السابق
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceedToNext()}
              >
                التالي
              </Button>
            ) : (
              <Button
                onClick={handleBooking}
                disabled={!canProceedToNext() || isLoading}
              >
                {isLoading ? 'جاري الحجز...' : 'تأكيد الحجز'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;


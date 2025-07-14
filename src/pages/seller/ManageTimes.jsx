import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Plus,
  Calendar,
  Clock,
  User,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { bookingService } from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const ManageTimes = () => {
  const { user } = useAuth();
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({
    date: '',
    time: ''
  });

  useEffect(() => {
    loadAvailableTimes();
  }, []);

  const loadAvailableTimes = async () => {
    setLoading(true);
    try {
      console.log('Loading available times...');
      console.log('User:', user);

      // Try to get both available and booked times
      const [availableRes, bookedRes] = await Promise.all([
        // Try to get available times - we'll handle errors gracefully
        bookingService.getAvailableTimesForShop(user?.shop?._id).catch(err => {
          console.log('Available times error:', err);
          return { data: [] };
        }),
        // Get booked times
        bookingService.getShopBookings().catch(err => {
          console.log('Booked times error:', err);
          return { data: [] };
        })
      ]);

      console.log('Available response:', availableRes);
      console.log('Booked response:', bookedRes);

      // Combine available and booked times
      const availableTimes = (availableRes.data || []).map(time => ({
        ...time,
        isBooked: false
      }));

      const bookedTimes = (bookedRes.data || []).map(time => ({
        ...time,
        isBooked: true
      }));

      const allTimes = [...availableTimes, ...bookedTimes];
      console.log('All times combined:', allTimes);

      setAvailableTimes(allTimes);
    } catch (error) {
      console.error('Error loading available times:', error);
      setAvailableTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = async (e) => {
    e.preventDefault();
    if (!newTimeSlot.date || !newTimeSlot.time) {
      alert('يرجى ملء جميع الحقول');
      return;
    }

    console.log('=== STARTING ADD TIME SLOT ===');
    console.log('Adding time slot:', newTimeSlot);
    console.log('User info:', user);
    console.log('User role:', user?.role);
    console.log('User shop:', user?.shop);
    console.log('Is seller?', user?.role === 'seller');
    console.log('=== USER CHECK COMPLETE ===');

    try {
      setLoading(true);

      // تحقق من أن المستخدم shop owner
      if (!user || user.role !== 'seller') {
        alert('يجب أن تكون صاحب محل لإضافة المواعيد');
        return;
      }

      const response = await bookingService.addAvailableTime(newTimeSlot);
      console.log('Add time slot response:', response);

      // تحقق من نجاح العملية
      if (response && (response.success || response.data)) {
        // Add the new time slot to the current list only if saved successfully
        const newTime = {
          ...response.data,
          date: newTimeSlot.date,
          time: newTimeSlot.time,
          isBooked: false,
          _id: response.data?._id || response._id || Date.now().toString()
        };

        setAvailableTimes(prev => [...prev, newTime]);
        setNewTimeSlot({ date: '', time: '' });
        setShowAddForm(false);
        alert('تم إضافة الموعد بنجاح وحفظه في قاعدة البيانات');

        // إعادة تحميل البيانات للتأكد من الحفظ
        await loadAvailableTimes();
      } else {
        throw new Error('فشل في حفظ الموعد في قاعدة البيانات');
      }
    } catch (error) {
      console.error('Error adding time slot:', error);
      console.error('Error details:', error.response?.data);

      let errorMessage = 'حدث خطأ في إضافة الموعد';
      if (error.response?.status === 401) {
        errorMessage = 'يجب تسجيل الدخول أولاً';
      } else if (error.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحية لإضافة المواعيد';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (timeId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      return;
    }

    try {
      setLoading(true);
      await bookingService.deleteAvailableTime(timeId);

      // Remove the time slot from the current list immediately
      setAvailableTimes(prev => prev.filter(time => time._id !== timeId));
      alert('تم حذف الموعد بنجاح');
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('حدث خطأ في حذف الموعد');
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

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Separate booked and available times
  const bookedTimes = availableTimes.filter(time => time.isBooked);
  const availableTimesOnly = availableTimes.filter(time => !time.isBooked);

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المواعيد</h1>
              <p className="text-gray-600 mt-2">إدارة المواعيد المتاحة والمحجوزة</p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <Plus size={20} />
              إضافة موعد متاح
            </Button>
          </div>
        </div>

        {/* Add Time Slot Form */}
        {showAddForm && (
          <Card className="mb-8 border-yellow-200">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
              <CardTitle className="text-yellow-800">إضافة موعد جديد</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddTimeSlot} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={newTimeSlot.date}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, date: e.target.value })}
                    min={getTomorrowDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوقت
                  </label>
                  <input
                    type="time"
                    value={newTimeSlot.time}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-2 rounded-md transition-all duration-300"
                  >
                    {loading ? 'جاري الإضافة...' : 'إضافة'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-md"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المواعيد</p>
                  <p className="text-3xl font-bold text-yellow-600">{availableTimes.length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المواعيد المحجوزة</p>
                  <p className="text-3xl font-bold text-green-600">{bookedTimes.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">المواعيد المتاحة</p>
                  <p className="text-3xl font-bold text-blue-600">{availableTimesOnly.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-csk-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Times */}
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  المواعيد المتاحة ({availableTimesOnly.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {availableTimesOnly.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">لا توجد مواعيد متاحة</p>
                    <p className="text-sm text-gray-500 mt-2">أضف مواعيد جديدة ليتمكن العملاء من حجزها</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {availableTimesOnly.map((time) => (
                      <div key={time._id} className="border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-gray-900">{formatDate(time.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-700">{formatTime(time.time)}</span>
                            </div>
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                              متاح للحجز
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTimeSlot(time._id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booked Times */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  المواعيد المحجوزة ({bookedTimes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {bookedTimes.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">لا توجد مواعيد محجوزة</p>
                    <p className="text-sm text-gray-500 mt-2">ستظهر هنا المواعيد التي يحجزها العملاء</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {bookedTimes.map((time) => (
                      <div key={time._id} className="border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-gray-900">{formatDate(time.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-green-600" />
                              <span className="text-gray-700">{formatTime(time.time)}</span>
                            </div>
                            {time.user && (
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">{time.user.name || time.user.email}</span>
                              </div>
                            )}
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              محجوز
                            </Badge>
                            {time.notes && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                <strong>ملاحظات:</strong> {time.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTimes;

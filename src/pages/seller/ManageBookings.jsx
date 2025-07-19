import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, User, Phone, Mail } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';

const ManageBookings = () => {
  const { user } = useAuth();
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState({
    date: '',
    time: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load shop bookings
      const bookingsResponse = await bookingService.getShopBookings();
      setBookings(bookingsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
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

    try {
      setLoading(true);
      await bookingService.addAvailableTime(newTimeSlot);
      setNewTimeSlot({ date: '', time: '' });
      setShowAddForm(false);
      await loadData();
      alert('تم إضافة الموعد بنجاح');
    } catch (error) {
      console.error('Error adding time slot:', error);
      alert('حدث خطأ في إضافة الموعد');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (timeId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموعد؟')) return;

    try {
      setLoading(true);
      await bookingService.removeAvailableTime(timeId);
      await loadData();
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">إدارة المواعيد</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              إضافة موعد متاح
            </button>
          </div>

          {/* Add Time Slot Form */}
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">إضافة موعد جديد</h3>
              <form onSubmit={handleAddTimeSlot} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={newTimeSlot.date}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوقت
                  </label>
                  <input
                    type="time"
                    value={newTimeSlot.time}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                  >
                    إضافة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">المواعيد المحجوزة</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد مواعيد محجوزة حتى الآن</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Calendar size={18} />
                          <span className="font-medium">{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Clock size={18} />
                          <span className="font-medium">{formatTime(booking.time)}</span>
                        </div>
                      </div>

                      {booking.user && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-semibold text-gray-900 mb-2">معلومات العميل:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-gray-500" />
                              <span>{booking.user.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail size={16} className="text-gray-500" />
                              <span>{booking.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={16} className="text-gray-500" />
                              <span>{booking.user.phone || 'غير محدد'}</span>
                            </div>
                          </div>
                          {booking.notes && (
                            <div className="mt-2">
                              <span className="text-gray-700 font-medium">ملاحظات: </span>
                              <span className="text-gray-600">{booking.notes}</span>
                            </div>
                          )}
                          <div className="mt-2">
                            <span className="text-gray-700 font-medium">نوع الموعد: </span>
                            <span className="text-gray-600">
                              {booking.appointmentType === 'consultation' && 'استشارة'}
                              {booking.appointmentType === 'viewing' && 'مشاهدة'}
                              {booking.appointmentType === 'purchase' && 'شراء'}
                              {booking.appointmentType === 'repair' && 'إصلاح'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;

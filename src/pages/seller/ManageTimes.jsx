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
      alert('Please fill in all fields');
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

      // Check if user is shop owner
      if (!user || user.role !== 'seller') {
        alert('You must be a shop owner to add appointments');
        return;
      }

      const response = await bookingService.addAvailableTime(newTimeSlot);
      console.log('Add time slot response:', response);

      // Check if operation was successful
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
        alert('Appointment added successfully and saved to database');

        // Reload data to confirm saving
        await loadAvailableTimes();
      } else {
        throw new Error('Failed to save appointment to database');
      }
    } catch (error) {
      console.error('Error adding time slot:', error);
      console.error('Error details:', error.response?.data);

      let errorMessage = 'Error adding appointment';
      if (error.response?.status === 401) {
        errorMessage = 'You must login first';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to add appointments';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (timeId) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      setLoading(true);
      await bookingService.deleteAvailableTime(timeId);

      // Remove the time slot from the current list immediately
      setAvailableTimes(prev => prev.filter(time => time._id !== timeId));
      alert('Appointment deleted successfully');
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('Error deleting appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
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
              <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
              <p className="text-gray-600 mt-2">Manage available and booked appointments</p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-[#A37F41] to-[#8A6C37] hover:from-[#8A6C37] hover:to-[#6D552C] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <Plus size={20} />
              Add Available Time
            </Button>
          </div>
        </div>

        {/* Add Time Slot Form */}
        {showAddForm && (
          <Card className="mb-8 border-[#E2D2B6]">
            <CardHeader className="bg-gradient-to-r from-[#F8F4ED] to-[#F0E8DB]">
              <CardTitle className="text-[#A37F41]">Add New Appointment</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddTimeSlot} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newTimeSlot.date}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, date: e.target.value })}
                    min={getTomorrowDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A37F41] focus:border-[#A37F41]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newTimeSlot.time}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A37F41] focus:border-[#A37F41]"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-[#A37F41] to-[#8A6C37] hover:from-[#8A6C37] hover:to-[#6D552C] text-white px-6 py-2 rounded-md transition-all duration-300"
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-md"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-[#E2D2B6]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                  <p className="text-3xl font-bold text-[#A37F41]">{availableTimes.length}</p>
                </div>
                <div className="p-3 bg-[#F0E8DB] rounded-full">
                  <Calendar className="w-6 h-6 text-[#A37F41]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D3BB92]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Booked Appointments</p>
                  <p className="text-3xl font-bold text-[#6D552C]">{bookedTimes.length}</p>
                </div>
                <div className="p-3 bg-[#E2D2B6] rounded-full">
                  <CheckCircle className="w-6 h-6 text-[#6D552C]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C5A56D]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Appointments</p>
                  <p className="text-3xl font-bold text-[#8A6C37]">{availableTimesOnly.length}</p>
                </div>
                <div className="p-3 bg-[#F8F4ED] rounded-full">
                  <Clock className="w-6 h-6 text-[#8A6C37]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A37F41] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Times */}
            <Card className="border-[#C5A56D]">
              <CardHeader className="bg-[#F8F4ED]">
                <CardTitle className="text-[#8A6C37] flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Available Appointments ({availableTimesOnly.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {availableTimesOnly.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No available appointments</p>
                    <p className="text-sm text-gray-500 mt-2">Add new appointments for customers to book</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {availableTimesOnly.map((time) => (
                      <div key={time._id} className="border border-[#C5A56D] rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-[#8A6C37]" />
                              <span className="font-medium text-gray-900">{formatDate(time.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-[#8A6C37]" />
                              <span className="text-gray-700">{formatTime(time.time)}</span>
                            </div>
                            <Badge variant="outline" className="border-[#C5A56D] text-[#8A6C37] bg-[#F8F4ED]">
                              Available for booking
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTimeSlot(time._id)}
                            className="text-[#B54A35] border-[#D3BB92] hover:bg-[#F8F4ED]"
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
            <Card className="border-[#D3BB92]">
              <CardHeader className="bg-[#F0E8DB]">
                <CardTitle className="text-[#6D552C] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Booked Appointments ({bookedTimes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {bookedTimes.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No booked appointments</p>
                    <p className="text-sm text-gray-500 mt-2">Customer bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {bookedTimes.map((time) => (
                      <div key={time._id} className="border border-[#D3BB92] rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-[#6D552C]" />
                              <span className="font-medium text-gray-900">{formatDate(time.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-[#6D552C]" />
                              <span className="text-gray-700">{formatTime(time.time)}</span>
                            </div>
                            {time.user && (
                              <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-[#6D552C]" />
                                <span className="text-gray-700">{time.user.name || time.user.email}</span>
                              </div>
                            )}
                            <Badge className="bg-[#E2D2B6] text-[#6D552C] border-[#D3BB92]">
                              Booked
                            </Badge>
                            {time.notes && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                <strong>Notes:</strong> {time.notes}
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

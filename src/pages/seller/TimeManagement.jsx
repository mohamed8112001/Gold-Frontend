"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";

import {
  Plus,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Filter,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import { bookingService } from "../../services/bookingService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { CalendarIcon } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ar } from "date-fns/locale";

registerLocale("ar", ar);

const TimeManagement = () => {
  const { user } = useAuth();
  const [allTimes, setAllTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'available', 'booked'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState({
    date: "",
    time: "",
  });

  useEffect(() => {
    loadAllTimes();
  }, []);

  const loadAllTimes = async () => {
    setLoading(true);
    console.log("Loading all times for user:", user);
    console.log("User shop:", user?.shop);

    try {
      // For now, let's just get booked times since we know this endpoint works
      console.log("Getting booked times...");
      const bookedRes = await bookingService.getShopBookings();
      console.log("Booked times response:", bookedRes);

      const bookedTimes = (bookedRes.data || []).map((time) => ({
        ...time,
        isBooked: true,
      }));

      console.log("Setting booked times:", bookedTimes);
      setAllTimes(bookedTimes);

      // TODO: Add available times when we figure out the correct endpoint
    } catch (error) {
      console.error("Error loading times:", error);
      setAllTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = async (e) => {
    e.preventDefault();
    if (!newTimeSlot.date || !newTimeSlot.time) {
      alert("يرجى ملء جميع الحقول");
      return;
    }

    console.log("Adding time slot:", newTimeSlot);
    console.log("User:", user);

    try {
      setLoading(true);
      const response = await bookingService.addAvailableTime(newTimeSlot);
      console.log("Add time slot response:", response);

      setNewTimeSlot({ date: "", time: "" });
      setShowAddForm(false);

      // Add the new time slot to the current list as available
      const newTime = {
        ...response.data,
        date: newTimeSlot.date,
        time: newTimeSlot.time,
        isBooked: false,
        _id: response.data?._id || Date.now().toString(),
      };

      setAllTimes((prev) => [...prev, newTime]);
      alert("تم إضافة الموعد بنجاح");
    } catch (error) {
      console.error("Error adding time slot:", error);
      console.error("Error details:", error.response?.data);
      alert(
        `حدث خطأ في إضافة الموعد: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (timeId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموعد؟")) {
      return;
    }

    try {
      setLoading(true);
      await bookingService.deleteAvailableTime(timeId);

      // Remove the time slot from the current list
      setAllTimes((prev) => prev.filter((time) => time._id !== timeId));
      alert("تم حذف الموعد بنجاح");
    } catch (error) {
      console.error("Error deleting time slot:", error);
      alert("حدث خطأ في حذف الموعد");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getAppointmentTypeLabel = (type) => {
    const types = {
      consultation: "استشارة",
      viewing: "معاينة",
      purchase: "شراء",
      repair: "إصلاح",
    };
    return types[type] || "استشارة";
  };

  const getAppointmentTypeColor = (type) => {
    const colors = {
      consultation: "bg-[#FFF0CC] text-[#A66A00] border-[#FFDB99]",
      viewing: "bg-[#FFE6B3] text-[#8A5700] border-[#E6A500]",
      purchase: "bg-[#FFDB99] text-[#C37C00] border-[#E6A500]",
      repair: "bg-[#FFF8E6] text-[#5A3800] border-[#FFE6B3]",
    };
    return colors[type] || "bg-[#FFF0CC] text-[#A66A00] border-[#FFDB99]";
  };

  // Filter times based on active tab and search
  const filteredTimes = allTimes.filter((time) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "available" && !time.isBooked) ||
      (activeTab === "booked" && time.isBooked);

    const matchesSearch =
      !searchTerm ||
      time.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      time.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate =
      !filterDate ||
      new Date(time.date).toISOString().split("T")[0] === filterDate;

    return matchesTab && matchesSearch && matchesDate;
  });

  // Statistics
  const bookedTimes = allTimes.filter((time) => time.isBooked);
  const availableTimes = allTimes.filter((time) => !time.isBooked);

  // Group times by date for better organization
  const groupedTimes = filteredTimes.reduce((groups, time) => {
    const date = new Date(time.date).toISOString().split("T")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(time);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTimes).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-1 to-primary-2 py-8 pt-20 font-cairo">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 font-cairo">
                إدارة المواعيد الشاملة
              </h1>
              <p className="text-secondary-800 mt-2 font-cairo">
                إضافة وإدارة جميع المواعيد المتاحة والمحجوزة
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <Plus size={20} />
              إضافة موعد جديد
            </Button>
          </div>
        </div>

        {/* Add Time Slot Form */}
        {showAddForm && (
          <Card className="mb-8 border-[#FFE6B3]">
            <CardHeader className="bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC]">
              <CardTitle className="text-[#C37C00]">
                إضافة موعد متاح جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form
                onSubmit={handleAddTimeSlot}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={newTimeSlot.date}
                    onChange={(e) =>
                      setNewTimeSlot({ ...newTimeSlot, date: e.target.value })
                    }
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
                    onChange={(e) =>
                      setNewTimeSlot({ ...newTimeSlot, time: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-6 py-2 rounded-md transition-all duration-300"
                  >
                    {loading ? "جاري الإضافة..." : "إضافة"}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    إجمالي المواعيد
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {allTimes.length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    المواعيد المحجوزة
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {bookedTimes.length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">
                    المواعيد المتاحة
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {availableTimes.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    معدل الحجز
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {allTimes.length > 0
                      ? Math.round((bookedTimes.length / allTimes.length) * 100)
                      : 0}
                    %
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Tabs */}
        <Card className="mb-8 border-[#FFE6B3]">
          <CardHeader className="bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC]">
            <CardTitle className="text-[#C37C00] flex items-center gap-2">
              <Filter className="w-5 h-5" />
              التصفية والبحث
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => setActiveTab("all")}
                className={
                  activeTab === "all" ? "bg-yellow-500 hover:bg-yellow-600" : ""
                }
              >
                جميع المواعيد ({allTimes.length})
              </Button>
              <Button
                variant={activeTab === "available" ? "default" : "outline"}
                onClick={() => setActiveTab("available")}
                className={
                  activeTab === "available"
                    ? "bg-[#C37C00] hover:bg-[#A66A00]"
                    : ""
                }
              >
                المتاحة ({availableTimes.length})
              </Button>
              <Button
                variant={activeTab === "booked" ? "default" : "outline"}
                onClick={() => setActiveTab("booked")}
                className={
                  activeTab === "booked"
                    ? "bg-[#8A5700] hover:bg-[#5A3800]"
                    : ""
                }
              >
                المحجوزة ({bookedTimes.length})
              </Button>
            </div>

            {/* Search and Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div dir="rtl" lang="ar">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    تصفية بالتاريخ
  </label>
 <input
  type="date"
  value={filterDate}
  onChange={(e) => setFilterDate(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hide-placeholder"
/>

</div>

              </div>
            </div>

            {(searchTerm || filterDate) && (
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterDate("");
                  }}
                  className="text-gray-600 border-gray-300"
                >
                  مسح الفلاتر
                </Button>
                <span className="text-sm text-gray-600">
                  عرض {filteredTimes.length} من {allTimes.length} موعد
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Times Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : filteredTimes.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <XCircle size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {allTimes.length === 0 ? "لا توجد مواعيد" : "لا توجد نتائج"}
                </h3>
                <p className="text-gray-600">
                  {allTimes.length === 0
                    ? "ابدأ بإضافة مواعيد متاحة ليتمكن العملاء من حجزها"
                    : "جرب تغيير معايير البحث أو الفلتر"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <Card key={date} className="border-[#FFE6B3]">
                <CardHeader className="bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC]">
                  <CardTitle className="text-[#C37C00] flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {formatDate(date)} ({groupedTimes[date].length} موعد)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    {groupedTimes[date]
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((time) => (
                        <div
                          key={time._id}
                          className={`border rounded-lg p-4 hover: transition- ${
                            time.isBooked
                              ? "border-[#FFDB99] bg-[#FFF8E6]"
                              : "border-[#FFE6B3] bg-[#FFF0CC]"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {/* Time and Status */}
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                  <Clock
                                    className={`w-4 h-4 ${
                                      time.isBooked
                                        ? "text-[#8A5700]"
                                        : "text-[#C37C00]"
                                    }`}
                                  />
                                  <span className="font-medium text-gray-900">
                                    {formatTime(time.time)}
                                  </span>
                                </div>
                                <Badge
                                  className={
                                    time.isBooked
                                      ? "bg-[#FFF8E6] text-[#B54A35] border-[#FFDB99]"
                                      : "bg-[#FFE6B3] text-[#C37C00] border-[#E6A500]"
                                  }
                                >
                                  {time.isBooked ? "محجوز" : "متاح للحجز"}
                                </Badge>
                                {time.isBooked && time.appointmentType && (
                                  <Badge
                                    className={getAppointmentTypeColor(
                                      time.appointmentType
                                    )}
                                  >
                                    {getAppointmentTypeLabel(
                                      time.appointmentType
                                    )}
                                  </Badge>
                                )}
                              </div>

                              {/* Customer Details (if booked) */}
                              {time.isBooked && time.user && (
                                <div className="bg-white p-4 rounded-md border border-green-200 mb-3">
                                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4 text-green-600" />
                                    تفاصيل العميل
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-600">
                                        الاسم:
                                      </span>
                                      <span className="font-medium">
                                        {time.user.name || "غير محدد"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-600">
                                        البريد:
                                      </span>
                                      <span className="font-medium">
                                        {time.user.email}
                                      </span>
                                    </div>
                                    {time.user.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-gray-500" />
                                        <span className="text-gray-600">
                                          التليفون:
                                        </span>
                                        <span className="font-medium">
                                          {time.user.phone}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {time.notes && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                      <div className="flex items-start gap-2">
                                        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-700 mb-1">
                                            ملاحظات العميل:
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {time.notes}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 ml-4">
                              {!time.isBooked && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteTimeSlot(time._id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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

export default TimeManagement;

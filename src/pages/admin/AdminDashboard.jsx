import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Users,
  Store,
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  RefreshCw,
  FileText,
  Menu,
  X,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";
import { shopService } from "../../services/shopService.js";
import { userService } from "../../services/userService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROUTES } from "../../utils/constants.js";
import { testAuthentication } from "../../utils/testAuth.js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    totalShops: 0,
    pendingShops: 0,
    approvedShops: 0,
    approvedUnpaidShops: 0,
    activeShops: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [pendingShops, setPendingShops] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    console.log("🔍 Auth state check:", {
      authLoading,
      user: !!user,
      isAdmin,
      userName: user?.name,
    });

    if (authLoading) {
      console.log("⏳ Authentication still loading, waiting...");
      return;
    }

    if (!user) {
      console.log("❌ No user found, redirecting to login");
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!isAdmin) {
      console.log("❌ User is not admin, redirecting to home");
      navigate("/");
      return;
    }

    console.log("✅ User is authenticated admin, loading data");
    loadAdminData();

    const interval = setInterval(() => {
      loadAdminData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, isAdmin, navigate, authLoading]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      let shopsData = [];

      try {
        const shopsResponse = await shopService.getAllShopsAdmin();
        shopsData = Array.isArray(shopsResponse)
          ? shopsResponse
          : shopsResponse.data || [];
        console.log("تم تحميل متاجر الإدارة:", shopsData);
      } catch (error) {
        console.warn(
          "فشل نقطة نهاية الإدارة، جارٍ المحاولة بنقطة النهاية العادية:",
          error
        );
        try {
          const shopsResponse = await shopService.getAllShops();
          shopsData = Array.isArray(shopsResponse)
            ? shopsResponse
            : shopsResponse.data || [];
          console.log("تم تحميل المتاجر العادية:", shopsData);
        } catch (fallbackError) {
          console.error("فشلت كلتا نقطتي النهاية:", fallbackError);
          shopsData = [];
        }
      }

      setAllShops(shopsData);

      const pendingShops = shopsData.filter((shop) => {
        const isPending = !shop.isApproved;
        console.log(`فحص تعليق متجر "${shop.name}":`, {
          id: shop._id || shop.id,
          isApproved: shop.isApproved,
          isPending: isPending,
        });
        return isPending;
      });

      console.log("عدد المتاجر المعلقة:", pendingShops.length);
      setPendingShops(pendingShops);

      let totalUsers = 0;
      try {
        const usersResponse = await userService.getAllUsers();
        const usersData = Array.isArray(usersResponse)
          ? usersResponse
          : usersResponse.data || [];
        totalUsers = usersData.length;
      } catch (error) {
        console.warn("تعذر تحميل عدد المستخدمين:", error);
        totalUsers = 0;
      }

      const pendingCount = shopsData.filter((shop) => !shop.isApproved).length;
      const approvedCount = shopsData.filter((shop) => shop.isApproved).length;
      const approvedUnpaidCount = shopsData.filter(
        (shop) => shop.isApproved && !shop.isPaid
      ).length;
      const activeCount = shopsData.filter(
        (shop) => shop.isApproved && shop.isPaid
      ).length;

      setStats({
        totalShops: shopsData.length,
        pendingShops: pendingCount,
        approvedShops: approvedCount,
        approvedUnpaidShops: approvedUnpaidCount,
        activeShops: activeCount,
        totalUsers: totalUsers,
        totalProducts: 0,
      });
    } catch (error) {
      console.error("خطأ في تحميل بيانات الإدارة:", error);
      setAllShops([]);
      setPendingShops([]);
      setStats({
        totalShops: 0,
        pendingShops: 0,
        approvedShops: 0,
        totalUsers: 0,
        totalProducts: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveShop = async (shopId) => {
    const shop = allShops.find((s) => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : "المتجر";
    const actualShopId = shop?._id || shop?.id || shopId;

    console.log("=== تصحيح الموافقة على المتجر ===");
    testAuthentication();

    try {
      setIsLoading(true);
      console.log(
        "استدعاء shopService.approveShopActivation بمعرف:",
        actualShopId
      );

      const result = await shopService.approveShopActivation(actualShopId);
      console.log("نتيجة الموافقة:", result);

      alert(
        `✅ تم الموافقة على طلب تفعيل متجر "${shopName}" بنجاح!\n\n` +
          "📧 تم إرسال إشعار فوري لصاحب المتجر\n" +
          "💳 يمكن لصاحب المتجر الآن المتابعة لعملية الدفع"
      );

      console.log("جارٍ إعادة تحميل بيانات الإدارة...");
      await loadAdminData();
    } catch (error) {
      console.error("=== خطأ في الموافقة ===");
      const errorMessage =
        error.response?.data?.message || error.message || "خطأ غير معروف";
      alert("حدث خطأ في الموافقة على المتجر: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectShop = async (shopId) => {
    const shop = allShops.find((s) => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : "المتجر";
    const actualShopId = shop?._id || shop?.id || shopId;

    const confirmed = window.confirm(
      `هل أنت متأكد من رفض متجر "${shopName}"؟\n\nسيتم إخفاء المتجر ولن يظهر للعملاء.`
    );

    if (confirmed) {
      try {
        setIsLoading(true);
        console.log("رفض المتجر بمعرف:", actualShopId);

        await shopService.rejectShop(actualShopId);
        alert(`تم رفض متجر "${shopName}". لن يظهر للعملاء.`);
        await loadAdminData();
      } catch (error) {
        console.error("خطأ في رفض المتجر:", error);
        alert("حدث خطأ في رفض المتجر: " + (error.message || "خطأ غير معروف"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateLegacyShops = async () => {
    const confirmed = window.confirm(
      "هل تريد تحديث جميع المتاجر القديمة لتصبح مُوافق عليها؟\n\nهذا سيجعل جميع المتاجر التي لا تحتوي على حالة موافقة واضحة تظهر كمُوافق عليها."
    );

    if (confirmed) {
      try {
        setIsLoading(true);

        const legacyShops = allShops.filter(
          (shop) =>
            !Object.prototype.hasOwnProperty.call(shop, "status") &&
            !Object.prototype.hasOwnProperty.call(shop, "approved") &&
            !Object.prototype.hasOwnProperty.call(shop, "isActive")
        );

        console.log("تم العثور على متاجر قديمة:", legacyShops.length);

        for (const shop of legacyShops) {
          try {
            await shopService.approveShopActivation(shop._id || shop.id);
            console.log(`تم تحديث المتجر القديم: ${shop.name}`);
          } catch (error) {
            console.error(`فشل تحديث المتجر ${shop.name}:`, error);
          }
        }

        alert(`تم تحديث ${legacyShops.length} متجر قديم بنجاح!`);
        await loadAdminData();
      } catch (error) {
        console.error("خطأ في تحديث المتاجر القديمة:", error);
        alert("حدث خطأ في تحديث المتاجر القديمة");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteShop = async (shopId) => {
    const shop = allShops.find((s) => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : "المتجر";
    const actualShopId = shop?._id || shop?.id || shopId;

    console.log("المتجر المراد حذفه:", shop);

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف متجر "${shopName}" نهائياً؟\n\nهذا الإجراء لا يمكن التراجع عنه وسيتم حذف:\n- بيانات المتجر\n- جميع المنتجات\n- جميع التقييمات\n- جميع الحجوزات المرتبطة`
    );

    if (confirmed) {
      try {
        setIsLoading(true);
        await shopService.deleteShop(actualShopId);
        alert(`تم حذف متجر "${shopName}" بنجاح من قاعدة البيانات`);
        await loadAdminData();
      } catch (error) {
        console.error("خطأ في حذف المتجر:", error);
        alert("حدث خطأ في حذف المتجر: " + (error.message || "خطأ غير معروف"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (shop) => {
    let status = "unknown";

    if (shop.isApproved === true) {
      status = "approved";
    } else if (shop.isApproved === false) {
      status = "pending";
    } else {
      status = "pending";
    }

    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 rounded-full">
            <Clock className="w-3 h-3 mr-1" />
            في الانتظار
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 rounded-full">
            <CheckCircle className="w-3 h-3 mr-1" />
            مُوافق عليه
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 px-3 py-1 rounded-full">
            <XCircle className="w-3 h-3 mr-1" />
            مرفوض
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="px-3 py-1 rounded-full">غير محدد</Badge>;
    }
  };

  const viewCommercialRecord = async (shop) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ لا يوجد token. يرجى تسجيل الدخول مرة أخرى.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shop/${shop.id}/commercial-record`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorMessage = `Error: ${response.status} - ${response.statusText}`;
        console.error(errorMessage);
        alert(`فشل في تحميل السجل التجاري. ${errorMessage}`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing commercial record:", error);
      alert("حدث خطأ أثناء عرض السجل التجاري. يرجى المحاولة مرة أخرى.");
    }
  };

  // Filter shops based on search and status
  const filteredShops = allShops.filter((shop) => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!filterStatus) return matchesSearch;
    
    const status = shop.isApproved ? "approved" : "pending";
    return matchesSearch && status === filterStatus;
  });

  // Mobile Navigation Component
  const MobileNav = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">لوحة الإدارة</h1>
        </div>
        <div className="w-10"></div>
      </div>
    </div>
  );

  // Sidebar Component
  const Sidebar = () => (
    <div className={`fixed lg:relative inset-y-0 right-0 z-40 w-80 bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      sidebarOpen ? 'translate-x-0' : 'translate-x-full'
    } lg:flex flex-col`}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar content */}
      <div className="relative z-40 flex flex-col h-full bg-white">
        {/* Header */}
        <div className="p-6 lg:p-8 border-b border-gray-100">
          <div className="flex items-center space-x-4 space-x-reverse">
           
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                لوحة التحكم 
              </h1>
              {/* <p className="text-sm text-gray-500">إدارة المنصة</p> */}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <nav className="space-y-2">
            {[
              { id: "overview", label: "نظرة عامة", icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
              { id: "pending", label: "طلبات الموافقة", icon: Clock, count: stats.pendingShops, color: "from-amber-500 to-orange-500" },
              { id: "shops", label: "جميع المتاجر", icon: Store, count: stats.totalShops, color: "from-green-500 to-emerald-600" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-right transition-all duration-200 group ${
                  activeTab === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold transition-all ${
                      activeTab === item.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-white group-hover:text-gray-800"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Stats */}
         
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-gray-100">
          <Button
            onClick={loadAdminData}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white transition-all duration-200 py-3 rounded-xl shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "جارٍ التحديث..." : "تحديث البيانات"}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-3">
            آخر تحديث: {new Date().toLocaleTimeString("ar-EG")}
          </p>
        </div>
      </div>
    </div>
  );

  // Loading Component
  const LoadingScreen = ({ title = "جارٍ التحميل..." }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center pt-16 lg:pt-0">
      <div className="bg-white rounded-3xl border border-blue-200/30 backdrop-blur-sm p-12 text-center shadow-2xl max-w-md mx-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-lg">
          <BarChart3 className="w-10 h-10 text-white" />
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mx-auto mb-8"></div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600">يرجى الانتظار لحظات...</p>
      </div>
    </div>
  );

  if (authLoading) {
    return <LoadingScreen title="جارٍ التحقق من الهوية..." />;
  }

  if (isLoading) {
    return <LoadingScreen title="جارٍ تحميل لوحة التحكم..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 pt-16">
      <MobileNav />
      
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {[
                { 
                  title: "إجمالي المتاجر", 
                  value: stats.totalShops, 
                  subtitle: "نشطة في النظام",
                  icon: Store, 
                  color: "from-blue-500 to-blue-600",
                  bgColor: "from-blue-50 to-blue-100",
                  onClick: () => setActiveTab("shops")
                },
                { 
                  title: "طلبات الموافقة", 
                  value: stats.pendingShops, 
                  subtitle: "في انتظار الموافقة",
                  icon: Clock, 
                  color: "from-amber-500 to-amber-600",
                  bgColor: "from-amber-50 to-amber-100",
                  onClick: () => setActiveTab("pending")
                },
                { 
                  title: "مُوافق عليها", 
                  value: stats.approvedUnpaidShops, 
                  subtitle: "في انتظار الدفع",
                  icon: CheckCircle, 
                  color: "from-green-500 to-green-600",
                  bgColor: "from-green-50 to-green-100"
                },
                // { 
                //   title: "المنتجات", 
                //   value: stats.totalProducts, 
                //   subtitle: "إجمالي المنتجات",
                //   icon: Package, 
                //   color: "from-purple-500 to-purple-600",
                //   bgColor: "from-purple-50 to-purple-100"
                // },
              ].map((stat, index) => (
                <Card 
                  key={index}
                  className={`bg-gradient-to-br ${stat.bgColor} border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
                  onClick={stat.onClick}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2 group-hover:text-gray-800 transition-colors">
                          {stat.title}
                        </p>
                        <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-600">
                          {stat.subtitle}
                        </p>
                      </div>
                      <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Recent Activities */}
                  <Card className="bg-white border-0 rounded-3xl overflow-hidden shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
                      <CardTitle className="flex items-center text-2xl font-bold">
                        <Calendar className="w-6 h-6 mr-4" />
                        الأنشطة الأخيرة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {pendingShops.length > 0 ? (
                          pendingShops.slice(0, 3).map((shop, index) => (
                            <div
                              key={shop.id}
                              className="flex items-center gap-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 hover:shadow-lg transition-all duration-300"
                            >
                              <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse shadow-sm"></div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-1">
                                  طلب جديد من "{shop.name}"
                                </p>
                                <p className="text-sm text-gray-600">
                                  {shop.createdAt
                                    ? new Date(shop.createdAt).toLocaleDateString("ar-EG")
                                    : "حديث"}
                                </p>
                              </div>
                              <Badge className="bg-amber-100 text-amber-800 border-amber-300 px-3 py-1 rounded-full">
                                معلق
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                              <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-sm"></div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-1">
                                  لا توجد طلبات معلقة
                                </p>
                                <p className="text-sm text-gray-600">
                                  كل شيء مكتمل!
                                </p>
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 px-3 py-1 rounded-full">
                                مكتمل
                              </Badge>
                            </div>
                            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                              <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-sm"></div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-1">
                                  النظام يعمل بشكل طبيعي
                                </p>
                                <p className="text-sm text-gray-600">
                                  جميع الخدمات تعمل
                                </p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1 rounded-full">
                                نشط
                              </Badge>
                            </div>
                          </>
                        )}
                        {stats.totalShops > 0 && (
                          <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200">
                            <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-slate-500 rounded-full shadow-sm"></div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 mb-1">
                                إجمالي {stats.totalShops} متجر في النظام
                              </p>
                              <p className="text-sm text-gray-600">
                                إحصائيات النظام
                              </p>
                            </div>
                            <Badge className="bg-gray-100 text-gray-800 border-gray-300 px-3 py-1 rounded-full">
                              معلومات
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-white border-0 rounded-3xl overflow-hidden shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8">
                      <CardTitle className="flex items-center text-2xl font-bold">
                        <TrendingUp className="w-6 h-6 mr-4" />
                        إجراءات سريعة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      {[
                        {
                          label: `مراجعة طلبات الموافقة (${stats.pendingShops})`,
                          icon: Clock,
                          color: "from-amber-500 to-orange-500",
                          action: () => setActiveTab("pending"),
                          disabled: stats.pendingShops === 0
                        },
                        {
                          label: `إدارة جميع المتاجر (${stats.totalShops})`,
                          icon: Store,
                          color: "from-blue-500 to-indigo-500",
                          action: () => setActiveTab("shops")
                        },
                        {
                          label: "تحديث البيانات",
                          icon: RefreshCw,
                          color: "from-green-500 to-emerald-500",
                          action: loadAdminData
                        },
                        {
                          label: "تحديث المتاجر القديمة",
                          icon: CheckCircle,
                          color: "from-purple-500 to-pink-500",
                          action: handleUpdateLegacyShops,
                          disabled: isLoading
                        }
                      ].map((action, index) => (
                        <Button
                          key={index}
                          className={`w-full justify-start bg-gradient-to-r ${action.color} hover:shadow-lg text-white transition-all duration-300 py-4 rounded-2xl text-lg font-medium ${
                            action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                          }`}
                          onClick={action.action}
                          disabled={action.disabled}
                        >
                          <action.icon className="w-6 h-6 mr-4" />
                          {action.label}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "pending" && (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="bg-white rounded-3xl border-0 shadow-xl p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                          طلبات الموافقة
                        </h2>
                        <p className="text-gray-600">مراجعة وموافقة طلبات المتاجر الجديدة</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 text-lg font-bold rounded-2xl shadow-lg">
                     (   {stats.pendingShops} ) طلبات في الانتظار
                      </Badge>
                    </div>
                  </div>

                  {pendingShops.length > 0 ? (
                    <div className="grid gap-8">
                      {pendingShops.map((shop) => (
                        <Card
                          key={shop.id}
                          className="bg-white border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-r-8 border-r-amber-400"
                        >
                          <CardContent className="p-8 lg:p-10">
                            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                              <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-3xl flex items-center justify-center shadow-lg">
                                    <Store className="w-8 h-8 text-amber-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-bold text-2xl lg:text-3xl text-gray-900 mb-3">
                                      {shop.name}
                                    </h3>
                                    {getStatusBadge(shop)}
                                  </div>
                                </div>
                                
                                <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                                  {shop.description}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                                    <span className="font-bold text-gray-900 block mb-3 text-lg">
                                      العنوان:
                                    </span>
                                    <p className="text-gray-700">{shop.address}</p>
                                  </div>
                                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                                    <span className="font-bold text-gray-900 block mb-3 text-lg">
                                      الهاتف:
                                    </span>
                                    <p className="text-gray-700">{shop.phone}</p>
                                  </div>
                                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                                    <span className="font-bold text-gray-900 block mb-3 text-lg">
                                      تاريخ الطلب:
                                    </span>
                                    <p className="text-gray-700">
                                      {new Date(shop.createdAt || Date.now()).toLocaleDateString("ar-EG")}
                                    </p>
                                  </div>
                                </div>

                                {/* Commercial Record */}
                                {shop.commercialRecord && (
                                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                      <div>
                                        <span className="font-bold text-blue-900 block mb-2 text-lg">
                                          السجل التجاري:
                                        </span>
                                        <p className="text-blue-700">
                                          انقر لعرض الوثيقة المرفوعة
                                        </p>
                                      </div>
                                      <Button
                                        size="lg"
                                        variant="outline"
                                        className="bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 px-6 py-3 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                                        onClick={() => viewCommercialRecord(shop)}
                                      >
                                        <FileText className="w-5 h-5 mr-3" />
                                        📄 عرض السجل التجاري
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-auto">
                                <Button
                                  size="lg"
                                  variant="outline"
                                  className="flex-1 lg:flex-none bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-6 py-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                                  onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id || shop.id))}
                                >
                                  <Eye className="w-5 h-5 mr-3" />
                                  عرض
                                </Button>
                                <Button
                                  size="lg"
                                  className="flex-1 lg:flex-none bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-300 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl"
                                  onClick={() => handleApproveShop(shop._id || shop.id)}
                                >
                                  <CheckCircle className="w-5 h-5 mr-3" />
                                  الموافقة
                                </Button>
                                <Button
                                  size="lg"
                                  className="flex-1 lg:flex-none bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-300 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl"
                                  onClick={() => handleRejectShop(shop._id || shop.id)}
                                >
                                  <XCircle className="w-5 h-5 mr-3" />
                                  الرفض
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border-0 shadow-xl p-16 text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <CheckCircle className="w-16 h-16 text-emerald-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        لا توجد طلبات معلقة
                      </h3>
                      <p className="text-gray-600 text-xl">
                        تمت مراجعة جميع طلبات المتاجر
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "shops" && (
                <div className="space-y-8">
                  {/* Header with Search and Filter */}
                  <div className="bg-white rounded-3xl border-0 shadow-xl p-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                          جميع المتاجر
                        </h2>
                        <p className="text-gray-600">إدارة ومراقبة جميع المتاجر في النظام</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 text-lg font-bold rounded-2xl shadow-lg">
                        {stats.totalShops} متجر
                      </Badge>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="البحث في المتاجر..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="pr-12 pl-8 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer min-w-[200px]"
                        >
                          <option value="">كل الحالات</option>
                          <option value="approved">مُوافق عليه</option>
                          <option value="pending">معلق</option>
                          <option value="rejected">مرفوض</option>
                        </select>
                        <ChevronDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {filteredShops.length > 0 ? (
                    <div className="grid gap-6">
                      {filteredShops.map((shop) => (
                        <Card
                          key={shop.id}
                          className="bg-white border-0 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 group"
                        >
                          <CardContent className="p-8">
                            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                  <Store className="w-10 h-10 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                                    <h4 className="font-bold text-2xl text-gray-900">
                                      {shop.name}
                                    </h4>
                                    {getStatusBadge(shop)}
                                  </div>
                                  <p className="text-gray-700 font-medium text-lg mb-2">
                                    {shop.address}
                                  </p>
                                  <p className="text-gray-500">
                                    تاريخ الإنشاء:{" "}
                                    {new Date(shop.createdAt || Date.now()).toLocaleDateString("ar-EG")}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                                <Button
                                  size="sm"
                                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-3 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                                  onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id || shop.id))}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  عرض
                                </Button>
                                {shop.commercialRecord && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 px-4 py-3 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                                    onClick={() => viewCommercialRecord(shop)}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    📄 السجل
                                  </Button>
                                )}
                                {!shop.isApproved && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-300 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl"
                                      onClick={() => handleApproveShop(shop._id || shop.id)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      الموافقة
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-300 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl"
                                      onClick={() => handleRejectShop(shop._id || shop.id)}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      الرفض
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white transition-all duration-300 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl"
                                  onClick={() => handleDeleteShop(shop._id || shop.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  حذف
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border-0 shadow-xl p-16 text-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <Store className="w-16 h-16 text-gray-500" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        {searchTerm || filterStatus ? "لا توجد نتائج" : "لا توجد متاجر"}
                      </h3>
                      <p className="text-gray-600 text-xl">
                        {searchTerm || filterStatus 
                          ? "لم يتم العثور على متاجر تطابق معايير البحث"
                          : "لم يتم إنشاء أي متاجر بعد"
                        }
                      </p>
                      {(searchTerm || filterStatus) && (
                        <Button
                          onClick={() => {
                            setSearchTerm("");
                            setFilterStatus("");
                          }}
                          className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          إعادة تعيين البحث
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
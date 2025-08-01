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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.jsx";
import {
  Edit,
  Plus,
  Eye,
  Trash2,
  Star,
  Calendar,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart,
  Shield,
  Tag,
  ShoppingCart,
  MapPin,
  QrCode,
  Download,
} from "lucide-react";
import { shopService } from "../../services/shopService.js";
import { productService } from "../../services/productService.js";
import { bookingService } from "../../services/bookingService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROUTES } from "../../utils/constants.js";

const ManageShop = () => {
  console.log("🎯 تم تحميل مكون إدارة المتجر");
  const navigate = useNavigate();
  const { user, isShopOwner } = useAuth();
  console.log("👤 المستخدم:", user, "مالك متجر:", isShopOwner);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBookings: 0,
    totalCustomers: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [qrCode, setQrCode] = useState(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);

  useEffect(() => {
    if (!user || !isShopOwner) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadShopData();
  }, [user, isShopOwner, navigate]);

  const loadShopData = async () => {
    console.log("sdaaaaaaaaaaaaaa");

    try {
      setIsLoading(true);

      // تحميل تفاصيل المتجر
      const loadShop = async () => {
        try {
          console.log("تحميل المتجر للمستخدم:", user.id);
          try {
            const userShopResponse = await shopService.getMyShop();
            const userShop = userShopResponse.data || userShopResponse;
            console.log("تم تحميل متجر المستخدم:", userShop);
            setShop(userShop);
            return userShop;
          } catch (userShopError) {
            console.warn(
              "لم يتم العثور على متجر للمستخدم، جاري محاولة البحث في جميع المتاجر:",
              userShopError
            );
            const shopResponse = await shopService.getAllShops();
            const shopsData = Array.isArray(shopResponse)
              ? shopResponse
              : shopResponse.data || [];
            const userShop = shopsData.find(
              (shop) =>
                shop.ownerId === user.id ||
                shop.owner === user.id ||
                shop.userId === user.id
            );

            if (userShop) {
              console.log(
                "تم العثور على متجر المستخدم في جم180يع المتاجر:",
                userShop
              );
              setShop(userShop);
              return userShop;
            } else {
              console.log(
                "لم يتم العثور على متجر للمستخدم، يحتاج المستخدم لإنشاء واحد"
              );
              setShop(null);
              return null;
            }
          }
        } catch (error) {
          console.error("خطأ في تحميل المتجر:", error);
          setShop(null);
          return null;
        }
      };

      // تحميل المنتجات للمتجر
      const loadProducts = async (shopId) => {
        try {
          const productsResponse = await productService.getProductsByShop(shopId);
          const productsData = Array.isArray(productsResponse)
            ? productsResponse
            : productsResponse.data || productsResponse.products || [];
          setProducts(productsData);
          return productsData;
        } catch (error) {
          console.error("خطأ في تحميل المنتجات:", error);
          setProducts([]);
          return [];
        }
      };

      // تحميل المواعيد للمتجر
      const loadBookings = async () => {
        try {
          const bookingsResponse = await bookingService.getMyBookings();
          const bookingsData = Array.isArray(bookingsResponse)
            ? bookingsResponse
            : bookingsResponse.data || bookingsResponse.bookings || [];
          setBookings(bookingsData);
          return bookingsData;
        } catch (error) {
          console.error("خطأ في تحميل المواعيد:", error);
          setBookings([]);
          return [];
        }
      };
      // تحميل البيانات بالتسلسل
      const shopData = await loadShop();
      const [productsData, bookingsData] = await Promise.all([
        loadProducts(shopData.id),
        loadBookings(),
      ]);
      
      // حساب الإحصائيات
      setStats({
        totalProducts: productsData.length,
        totalBookings: bookingsData.length,
        totalCustomers: shopData.customerCount || 45,
        averageRating: shopData.rating || 4.7,
      });
    } catch (error) {
      console.error("خطأ في تحميل بيانات المتجر:", error);
      setShop(null);
      setProducts([]);
      setBookings([]);
      setStats({
        totalProducts: 0,
        totalBookings: 0,
        totalCustomers: 0,
        averageRating: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المنتج؟");
    if (confirmed) {
      try {
        console.log("🗑️ حذف المنتج برقم:", productId);
        await productService.deleteProduct(productId);
        setProducts((prev) =>
          prev.filter((product) => {
            const id = product._id || product.id;
            return id !== productId;
          })
        );
        alert("تم حذف المنتج بنجاح!");
        console.log("✅ تم حذف المنتج بنجاح");
      } catch (error) {
        console.error("❌ خطأ في حذف المنتج:", error);
        alert("خطأ في حذف المنتج: " + (error.message || "خطأ غير معروف"));
      }
    }
  };

  const loadQRCode = async (shopId) => {
    console.log("🔄 تحميل رمز الاستجابة السريعة للمتجر:", shopId);
    try {
      setQrCodeLoading(true);
      console.log("📡 استدعاء shopService.getQRCode...");
      const response = await shopService.getQRCode(shopId);
      console.log("✅ تم تحميل رمز الاستجابة السريعة بنجاح:", response.data);
      setQrCode(response.data);
    } catch (error) {
      console.error("❌ خطأ في تحميل رمز الاستجابة السريعة:", error);
      try {
        console.log("🔄 محاولة إنشاء رمز استجابة سريعة جديد...");
        const generateResponse = await shopService.generateQRCode(shopId);
        console.log(
          "✅ تم إنشاء رمز الاستجابة السريعة بنجاح:",
          generateResponse.data
        );
        setQrCode(generateResponse.data);
      } catch (generateError) {
        console.error("❌ خطأ في إنشاء رمز الاستجابة السريعة:", generateError);
      }
    } finally {
      setQrCodeLoading(false);
    }
  };

  const generateNewQRCode = async () => {
    if (!shop) return;
    try {
      setQrCodeLoading(true);
      const response = await shopService.generateQRCode(shop._id || shop.id);
      setQrCode(response.data);
      alert("تم إنشاء رمز الاستجابة السريعة بنجاح!");
    } catch (error) {
      console.error("خطأ في إنشاء رمز الاستجابة السريعة:", error);
      alert("حدث خطأ أثناء إنشاء رمز الاستجابة السريعة");
    } finally {
      setQrCodeLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode || !shop) return;
    try {
      const link = document.createElement("a");
      link.href = qrCode.qrCode;
      const cleanShopName = shop.name
        .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "")
        .replace(/\s+/g, "-")
        .trim();
      link.download = `${cleanShopName}-رمز-الاستجابة-السريعة.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("تم تحميل رمز الاستجابة السريعة بنجاح");
    } catch (error) {
      console.error("خطأ في تحميل رمز الاستجابة السريعة:", error);
      alert("حدث خطأ أثناء تحميل رمز الاستجابة السريعة");
    }
  };

  useEffect(() => {
    console.log("🏪 تغيير بيانات المتجر:", shop);
    if (shop && (shop._id || shop.id)) {
      console.log(
        "🚀 تفعيل تحميل رمز الاستجابة السريعة للمتجر:",
        shop._id || shop.id
      );
      loadQRCode(shop._id || shop.id);
    } else {
      console.log("⚠️ لا توجد بيانات متجر متاحة لتحميل رمز الاستجابة السريعة");
    }
  }, [shop]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center pt-20"
        dir="rtl"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-cairo">
            جاري تحميل بيانات المتجر...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-cairo">
                إدارة المتجر
              </h1>
              {shop && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-medium text-gray-700 font-cairo">
                    {shop.name}
                  </span>
                  {shop.status === "pending" ||
                  shop.approved === false ||
                  shop.isActive === false ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1 font-cairo">
                      <Clock className="w-3 h-3" />
                      في انتظار الموافقة
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1 font-cairo">
                      <CheckCircle className="w-3 h-3" />
                      مُوافق عليه
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(ROUTES.SHOP_DETAILS(shop?.id || shop?._id))
                }
                className="font-cairo"
              >
                <Eye className="w-4 h-4 ml-2" />
                عرض المتجر
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.EDIT_SHOP)}
                className="font-cairo"
              >
                <Edit className="w-4 h-4 ml-2" />
                تحديث المتجر
              </Button>
              <Button
                onClick={() => navigate(ROUTES.PRODUCTS_CREATE)}
                className="font-cairo"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج
              </Button>
            </div>
          </div>
          <p className="text-gray-600 font-cairo">
            إدارة متجرك ومنتجاتك ومواعيدك
            {shop &&
              (shop.status === "pending" ||
                shop.approved === false ||
                shop.isActive === false) && (
                <span className="block text-yellow-600 text-sm mt-1 flex items-center gap-1 font-cairo">
                  <AlertTriangle className="w-4 h-4" />
                  متجرك في انتظار موافقة الإدارة ولن يكون مرئياً للعملاء حتى
                  الموافقة عليه.
                </span>
              )}
          </p>
        </div>

        {/*  */}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
          dir="rtl"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
            <TabsTrigger value="overview" className="text-sm font-cairo">
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="products" className="text-sm font-cairo">
              المنتجات ({products.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-sm font-cairo">
              المواعيد ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="qrcode" className="text-sm font-cairo">
              رمز الاستجابة السريعة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#C37C00] text-2xl font-bold font-cairo">معلومات المتجر</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(ROUTES.EDIT_SHOP)}
                    className="font-cairo border-[#C37C00] text-[#C37C00] hover:bg-[#FFF0CC]"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1 font-cairo">اسم المتجر</p>
                    <p className="text-gray-900 font-medium font-cairo">{shop?.name || "غير محدد"}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1 font-cairo">الهاتف</p>
                    <p className="text-gray-900 font-cairo">{shop?.phone || "غير محدد"}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1 font-cairo">الموقع</p>
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${shop?.location && shop?.location.coordinates ? "text-green-500" : "text-gray-400"}`} />
                      <p className="text-gray-900 font-cairo">
                        {shop?.location && shop?.location.coordinates ? "تم تحديد الموقع على الخريطة" : "لم يتم تحديد الموقع"}
                      </p>
                    </div>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 bg-white p-4 rounded-lg shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1 font-cairo">الوصف</p>
                    <p className="text-gray-900 font-cairo">{shop?.description || "لا يوجد وصف"}</p>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 bg-white p-4 rounded-lg shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1 font-cairo">العنوان</p>
                    <p className="text-gray-900 font-cairo">{shop?.address || "لم يتم تحديد العنوان"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold font-cairo">منتجاتي</h2>
              <Button
                onClick={() => navigate(ROUTES.PRODUCTS_CREATE)}
                className="font-cairo bg-[#C37C00] hover:bg-[#A66A00]"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج جديد
              </Button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3  gap-6 ">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden shadow-md hover:shadow-xl  transition-shadow">
                    <div className="relative">
                      <img
                        src={
                          product.logoUrl
                            ? `${import.meta.env.VITE_API_BASE_URL}/product-image/${product.logoUrl}`
                            : "/placeholder-product.jpg"
                        }
                        alt={product.title || product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 right-3 flex items-start gap-2">
                        {product.isFeatured && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 font-cairo">
                            مميز
                          </span>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 font-cairo">
                            {product.title || product.name}
                          </h3>
                          {product.description && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-2 font-cairo">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-yellow-600 font-bold text-xl font-cairo">
                            {product.price?.["$numberDecimal"]
                              ? product.price["$numberDecimal"] * 50
                              : product.price}{" "}
                            ج.م
                          </p>
                          {product.oldPrice && (
                            <p className="text-gray-400 text-sm line-through font-cairo">
                              {product.oldPrice["$numberDecimal"] * 50} ج.م
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 my-3 text-sm">
                        <div className="flex items-center text-gray-600 font-cairo">
                          <Package className="w-4 h-4 ml-1 text-gray-400" />
                          <span>المخزن: {product.stock || 0}</span>
                        </div>
                        <div className="flex items-center text-gray-600 font-cairo">
                          <Tag className="w-4 h-4 ml-1 text-gray-400" />
                          <span>الفئة: {product.category}</span>
                        </div>
                        <div className="flex items-center text-gray-600 font-cairo">
                          <Calendar className="w-4 h-4 ml-1 text-gray-400" />
                          <span>
                            أضيف في:{" "}
                            {new Date(product.createdAt).toLocaleDateString("ar-EG")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 border-t border-gray-100 pt-3">
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-cairo"
                          onClick={() => navigate(ROUTES.PRODUCT_DETAILS(product._id))}
                        >
                          <Eye className="w-4 h-4 ml-1" />
                          عرض التفاصيل
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 font-cairo"
                          onClick={() => navigate(ROUTES.EDIT_PRODUCT(product._id))}
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          تعديل المنتج
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-cairo"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2 font-cairo">
                  لا توجد منتجات
                </h3>
                <p className="text-gray-600 mb-4 font-cairo">
                  ابدأ بإضافة منتجاتك الأولى
                </p>
                <Button
                  onClick={() => navigate(ROUTES.PRODUCTS_CREATE)}
                  className="font-cairo"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة منتج جديد
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold font-cairo">المواعيد</h2>
              <Button
                onClick={() => navigate(ROUTES.MANAGE_BOOKINGS)}
                className="font-cairo bg-[#C37C00] hover:bg-[#A66A00]"
              >
                <Calendar className="w-4 h-4 ml-2" />
                إدارة المواعيد
              </Button>
            </div>

            {bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-green-100 text-green-600">{booking.customerName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-green-900">{booking.customerName}</h4>
                          <p className="text-sm text-green-700">{booking.appointmentType}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {new Date(booking.date).toLocaleDateString("ar-EG")}
                        </p>
                        <p className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {booking.time}
                        </p>
                        <Badge 
                          className={booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {booking.status === "confirmed" ? "مؤكد" : "في الانتظار"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2 font-cairo">
                  لا توجد مواعيد
                </h3>
                <p className="text-gray-600 font-cairo">
                  ستظهر هنا المواعيد المحجوزة من العملاء
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="qrcode" className="space-y-6">
            {console.log("🎨 يتم عرض تبويب رمز الاستجابة السريعة", {
              qrCode,
              qrCodeLoading,
              activeTab,
            })}
            <Card className="bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#C37C00] text-2xl font-bold font-cairo flex items-center gap-2">
                  <QrCode className="w-6 h-6" />
                  رمز الاستجابة السريعة للمتجر
                </CardTitle>
                <CardDescription className="text-[#A66A00] font-cairo">
                  يمكن للعملاء مسح هذا الرمز للوصول مباشرة إلى صفحة متجرك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {qrCodeLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C37C00] mx-auto mb-4"></div>
                    <p className="text-[#A66A00] font-cairo">
                      جاري تحميل رمز الاستجابة السريعة...
                    </p>
                  </div>
                ) : qrCode ? (
                  <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="bg-white p-6 rounded-xl border-2 border-[#FFE6B3] text-center shadow-md">
                          <img
                            src={qrCode.qrCode}
                            alt="رمز الاستجابة السريعة"
                            className="w-64 h-64 mx-auto mb-4 rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="bg-[#FFF0CC] p-4 rounded-xl border border-[#FFDB99] shadow">
                          <h3 className="font-semibold text-[#C37C00] mb-2 font-cairo text-lg">
                            كيفية الاستخدام:
                          </h3>
                          <ul className="text-sm text-[#A66A00] space-y-2 font-cairo">
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                              اطبع الرمز وضعه في متجرك
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                              العملاء يمكنهم مسحه بالهاتف
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                              توجيه مباشر لصفحة متجرك
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                              تصفح المنتجات وحجز مواعيد
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <Button
                            onClick={downloadQRCode}
                            className="w-full bg-[#4CAF50] hover:bg-[#43A047] font-cairo text-white"
                          >
                            <Download className="w-4 h-4 ml-2" />
                            تحميل الرمز
                          </Button>
                          {/* <Button
                            onClick={generateNewQRCode}
                            variant="outline"
                            className="w-full border-[#C37C00] text-[#C37C00] hover:bg-[#FFF0CC] font-cairo"
                            disabled={qrCodeLoading}
                          >
                            <QrCode className="w-4 h-4 ml-2" />
                            إنشاء رمز جديد
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2 font-cairo">
                      لا يوجد رمز استجابة سريعة
                    </h3>
                    <p className="text-gray-600 mb-4 font-cairo">
                      قم بإنشاء رمز استجابة سريعة لمتجرك ليتمكن العملاء من
                      الوصول إليه بسهولة
                    </p>
                    <Button
                      onClick={generateNewQRCode}
                      className="bg-[#C37C00] hover:bg-[#A66A00] font-cairo"
                      disabled={qrCodeLoading}
                    >
                      <QrCode className="w-4 h-4 ml-2" />
                      إنشاء رمز استجابة سريعة
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageShop;

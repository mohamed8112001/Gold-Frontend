import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
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
    ShoppingCart
} from 'lucide-react';
import { shopService } from '../../services/shopService.js';
import { productService } from '../../services/productService.js';
import { bookingService } from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const ManageShop = () => {
    const navigate = useNavigate();
    const { user, isShopOwner } = useAuth();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalBookings: 0,
        totalCustomers: 0,
        averageRating: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!user || !isShopOwner) {
            navigate(ROUTES.LOGIN);
            return;
        }
        loadShopData();
    }, [user, isShopOwner, navigate]);

    const loadShopData = async () => {
        try {
            setIsLoading(true);

            // Load shop details - get current user's shop
            const loadShop = async () => {
                try {
                    console.log('Loading shop for user:', user.id);

                    // Try to get user's shop first
                    try {
                        const userShopResponse = await shopService.getMyShop();
                        const userShop = userShopResponse.data || userShopResponse;
                        console.log('User shop loaded:', userShop);
                        setShop(userShop);
                        return userShop;
                    } catch (userShopError) {
                        console.warn('No user shop found, trying all shops:', userShopError);

                        // Fallback: get all shops and filter by user
                        const shopResponse = await shopService.getAllShops();
                        const shopsData = Array.isArray(shopResponse) ? shopResponse : shopResponse.data || [];

                        // Filter shops by current user (owner)
                        const userShop = shopsData.find(shop =>
                            shop.ownerId === user.id ||
                            shop.owner === user.id ||
                            shop.userId === user.id
                        );

                        if (userShop) {
                            console.log('Found user shop in all shops:', userShop);
                            setShop(userShop);
                            return userShop;
                        } else {
                            console.log('No shop found for user, user needs to create one');
                            setShop(null);
                            return null;
                        }
                    }
                } catch (error) {
                    console.error('Error loading shop:', error);
                    setShop(null);
                    return null;
                }
            };

            // Load products for the shop
            const loadProducts = async (shopId) => {
                try {
                    const productsResponse = await productService.getAllProducts({ shopId });
                    const productsData = Array.isArray(productsResponse)
                        ? productsResponse
                        : productsResponse.data || productsResponse.products || [];
                    setProducts(productsData);
                    return productsData;
                } catch (error) {
                    console.error('Error loading products:', error);
                    setProducts(mockProducts);
                    return mockProducts;
                }
            };

            // Load bookings for the shop
            const loadBookings = async () => {
                try {
                    const bookingsResponse = await bookingService.getMyBookings();
                    const bookingsData = Array.isArray(bookingsResponse)
                        ? bookingsResponse
                        : bookingsResponse.data || bookingsResponse.bookings || [];
                    setBookings(bookingsData);
                    return bookingsData;
                } catch (error) {
                    console.error('Error loading bookings:', error);
                    setBookings(mockBookings);
                    return mockBookings;
                }
            };

            // Load data sequentially
            const shopData = await loadShop();
            const [productsData, bookingsData] = await Promise.all([
                loadProducts(shopData.id),
                loadBookings()
            ]);

            // Calculate stats
            setStats({
                totalProducts: productsData.length,
                totalBookings: bookingsData.length,
                totalCustomers: shopData.customerCount || 45,
                averageRating: shopData.rating || 4.7
            });

        } catch (error) {
            console.error('Error loading shop data:', error);
            // Fallback to mock data
            setShop(mockShop);
            setProducts(mockProducts);
            setBookings(mockBookings);
            setStats({
                totalProducts: mockProducts.length,
                totalBookings: mockBookings.length,
                totalCustomers: 45,
                averageRating: 4.7
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        const confirmed = window.confirm('هل أنت متأكد من حذف هذا المنتج؟');

        if (confirmed) {
            try {
                await productService.deleteProduct(productId);
                setProducts(prev => prev.filter(product => product.id !== productId));
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    // Mock data
    const mockShop = {
        id: 1,
        name: 'مجوهرات الإسكندرية',
        description: 'متجر مجوهرات فاخر متخصص في الذهب والمجوهرات الثمينة',
        address: 'شارع فؤاد، الإسكندرية',
        phone: '+20 3 123 4567',
        email: 'info@alexandria-jewelry.com',
        rating: 4.7,
        reviewCount: 156,
        verified: true
    };

    const mockProducts = [
        {
            id: 1,
            name: 'خاتم ذهبي كلاسيكي',
            price: 2500,
            category: 'rings',
            image: '/api/placeholder/300/300',
            status: 'active',
            views: 245,
            favorites: 12
        },
        {
            id: 2,
            name: 'سلسلة ذهبية فاخرة',
            price: 4200,
            category: 'chains',
            image: '/api/placeholder/300/300',
            status: 'active',
            views: 189,
            favorites: 8
        },
        {
            id: 3,
            name: 'أسورة ذهبية مرصعة',
            price: 3800,
            category: 'bracelets',
            image: '/api/placeholder/300/300',
            status: 'draft',
            views: 67,
            favorites: 3
        }
    ];

    const mockBookings = [
        {
            id: 1,
            customerName: 'أحمد محمد',
            date: '2024-01-25',
            time: '14:00',
            status: 'confirmed'
        },
        {
            id: 2,
            customerName: 'فاطمة علي',
            date: '2024-01-22',
            time: '16:30',
            status: 'pending'
        }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل بيانات المتجر...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">إدارة المتجر</h1>
                            {shop && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-lg font-medium text-gray-700">{shop.name}</span>
                                    {shop.status === 'pending' || shop.approved === false || shop.isActive === false ? (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            في انتظار الموافقة
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
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
                                onClick={() => navigate(ROUTES.SHOP_DETAILS(shop?.id || shop?._id))}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                عرض المتجر
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate(ROUTES.EDIT_SHOP)}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                تحديث المتجر
                            </Button>
                            <Button onClick={() => navigate(ROUTES.PRODUCTS_CREATE)}>
                                <Plus className="w-4 h-4 mr-2" />
                                إضافة منتج
                            </Button>
                        </div>
                    </div>
                    <p className="text-gray-600">
                        إدارة متجرك ومنتجاتك ومواعيدك
                        {shop && (shop.status === 'pending' || shop.approved === false || shop.isActive === false) && (
                            <span className="block text-yellow-600 text-sm mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                متجرك في انتظار موافقة الإدارة ولن يظهر للعملاء حتى الموافقة عليه
                            </span>
                        )}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Package className="w-8 h-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">المنتجات</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Calendar className="w-8 h-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">المواعيد</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Users className="w-8 h-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">العملاء</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Star className="w-8 h-8 text-yellow-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">التقييم</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                        <TabsTrigger value="products">المنتجات ({products.length})</TabsTrigger>
                        <TabsTrigger value="bookings">المواعيد ({bookings.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Shop Info */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>معلومات المتجر</CardTitle>
                                        <Button size="sm" variant="outline">
                                            <Edit className="w-4 h-4 mr-1" />
                                            تعديل
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">اسم المتجر</p>
                                        <p className="text-gray-900">{shop?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">الوصف</p>
                                        <p className="text-gray-900">{shop?.description}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">العنوان</p>
                                        <p className="text-gray-900">{shop?.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">الهاتف</p>
                                        <p className="text-gray-900">{shop?.phone}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>النشاط الأخير</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <p className="text-sm">تم حجز موعد جديد من أحمد محمد</p>
                                            <span className="text-xs text-gray-500 mr-auto">منذ ساعة</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <p className="text-sm">تم إضافة منتج جديد: خاتم ذهبي</p>
                                            <span className="text-xs text-gray-500 mr-auto">منذ 3 ساعات</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                            <p className="text-sm">تقييم جديد: 5 نجوم</p>
                                            <span className="text-xs text-gray-500 mr-auto">أمس</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="products" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">منتجاتي</h2>
                            <Button onClick={() => navigate(ROUTES.PRODUCTS_CREATE)}>
                                <Plus className="w-4 h-4 mr-2" />
                                إضافة منتج جديد
                            </Button>
                        </div>

                        {products.length > 0 ? (
                            <div className="grid gap-6">
                                {products.map((product) => (
                                    <Card key={product.id}>
                                        <CardContent className="p-6">
                                            <p>{JSON.stringify(product)}</p>
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
                                                {/* Top Section - Image with Status and Quick Actions */}
                                                <div className="relative group">
                                                    <img
                                                        src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${product.logoUrl}` || '/placeholder-product.jpg'}
                                                        alt={product.name}
                                                        className="w-full h-48 object-cover"
                                                    />

                                                    {/* Status and Floating Actions */}
                                                    <div className="absolute top-3 left-3 flex items-start gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {product.status === 'active' ? 'نشط' : 'مسودة'}
                                                        </span>

                                                        {product.isFeatured && (
                                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                                                مميز
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Quick View Button (appears on hover) */}
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <Button
                                                            size="sm"
                                                            className="bg-white text-gray-800 shadow-md hover:bg-gray-50"
                                                            onClick={() => navigate(ROUTES.PRODUCT_DETAILS(product.id))}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            معاينة سريعة
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Main Content Section */}
                                                <div className="p-4">
                                                    {/* Title and Price */}
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                                                            {product.description && (
                                                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-yellow-600 font-bold text-xl">
                                                                {product.price['$numberDecimal'] * 50} ج.م
                                                            </p>
                                                            {product.oldPrice && (
                                                                <p className="text-gray-400 text-sm line-through">
                                                                    {product.oldPrice['$numberDecimal'] * 50} ج.م
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Metadata Grid */}
                                                    <div className="grid grid-cols-2 gap-2 my-3 text-sm">
                                                        <div className="flex items-center text-gray-600">
                                                            <Shield className="w-4 h-4 mr-1 text-gray-400" />
                                                            <span>الضمان: {product.warranty || 'غير متوفر'}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Package className="w-4 h-4 mr-1 text-gray-400" />
                                                            <span>المخزن: {product.stock || 0}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Tag className="w-4 h-4 mr-1 text-gray-400" />
                                                            <span>الفئة: {product.category}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                                            <span>أضيف في: {new Date(product.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    {/* Stats Bar */}
                                                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-3 text-sm">
                                                        <div className="flex items-center text-gray-600">
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            <span>{product.views || 0} مشاهدات</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Heart className="w-4 h-4 mr-1" />
                                                            <span>{product.favorites || 0} مفضلة</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <ShoppingCart className="w-4 h-4 mr-1" />
                                                            <span>{product.orders || 0} طلبات</span>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600"
                                                            onClick={() => navigate(ROUTES.PRODUCT_DETAILS(product._id))}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            عرض التفاصيل
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800"
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            تعديل المنتج
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600"
                                                            onClick={() => handleDeleteProduct(product._id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            حذف
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد منتجات
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    ابدأ بإضافة منتجاتك الأولى
                                </p>
                                <Button onClick={() => navigate(ROUTES.PRODUCTS_CREATE)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    إضافة منتج جديد
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="bookings" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">المواعيد</h2>
                            <Button onClick={() => navigate(ROUTES.MANAGE_BOOKINGS)}>
                                <Calendar className="w-4 h-4 mr-2" />
                                إدارة المواعيد
                            </Button>
                        </div>

                        {bookings.length > 0 ? (
                            <div className="grid gap-4">
                                {bookings.map((booking) => (
                                    <Card key={booking.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium">{booking.customerName}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(booking.date).toLocaleDateString('ar-EG')} في {booking.time}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {booking.status === 'confirmed' ? 'مؤكد' : 'في الانتظار'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد مواعيد
                                </h3>
                                <p className="text-gray-600">
                                    ستظهر هنا المواعيد المحجوزة من العملاء
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ManageShop;
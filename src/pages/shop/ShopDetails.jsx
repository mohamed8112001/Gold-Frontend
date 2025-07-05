import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import {
    ArrowLeft,
    Star,
    MapPin,
    Phone,
    Clock,
    Calendar,
    Heart,
    Eye,

    Grid,
    List
} from 'lucide-react';
import { shopService } from '../../services/shopService.js';
import { productService } from '../../services/productService.js';
import { rateService } from '../../services/rateService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const ShopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [viewMode, setViewMode] = useState('grid');

    // Ensure arrays are always arrays to prevent map errors
    const safeProducts = Array.isArray(products) ? products : [];
    const safeReviews = Array.isArray(reviews) ? reviews : [];

    useEffect(() => {
        if (id) {
            loadShopDetails();
        }
    }, [id]);

    const loadShopDetails = async () => {
        try {
            setIsLoading(true);

            // Load shop details
            try {
                const shopResponse = await shopService.getShop(id);
                const shopData = shopResponse.data || shopResponse;

                // Check if shop is approved for regular users
                const isApproved = (
                    shopData.status === 'approved' ||
                    shopData.approved === true ||
                    shopData.isActive === true ||
                    (!Object.prototype.hasOwnProperty.call(shopData, 'status') &&
                        !Object.prototype.hasOwnProperty.call(shopData, 'approved') &&
                        !Object.prototype.hasOwnProperty.call(shopData, 'isActive') &&
                        !shopData.status &&
                        shopData.approved !== false &&
                        shopData.isActive !== false)
                );

                console.log('Shop approval status:', {
                    name: shopData.name,
                    status: shopData.status,
                    approved: shopData.approved,
                    isActive: shopData.isActive,
                    isApproved: isApproved
                });

                if (!isApproved && user?.role !== 'admin') {
                    // Shop is not approved and user is not admin
                    console.log('Shop not approved for regular user');
                    setShop(null);
                    return;
                }

                // Ensure shop has all required fields
                const processedShopData = {
                    ...shopData,
                    rating: shopData.rating || 0,
                    specialties: Array.isArray(shopData.specialties) ? shopData.specialties : [],
                    gallery: Array.isArray(shopData.gallery) ? shopData.gallery : [],
                    image: shopData.image || shopData.imageUrl || '/placeholder-shop.jpg'
                };

                console.log('Processed shop data:', processedShopData);
                setShop(processedShopData);
            } catch (shopError) {
                console.error('Error loading shop details:', shopError);
                setShop(null);
            }

            // Load shop products
            const loadProducts = async () => {
                try {
                    const productsResponse = await productService.getProductsByShop(id);
                    const productsData = Array.isArray(productsResponse)
                        ? productsResponse
                        : productsResponse.data || productsResponse.products || [];

                    // Debug: Log the first product to understand the data structure
                    if (productsData.length > 0) {
                        console.log('📦 Sample product data:', productsData[0]);
                        console.log('📦 Product keys:', Object.keys(productsData[0]));
                    }

                    setProducts(productsData);
                } catch (error) {
                    console.error('Error loading products:', error);
                    setProducts([]);
                }
            };

            // Load shop reviews
            const loadReviews = async () => {
                try {
                    const reviewsResponse = await rateService.getAllRates({ shopId: id });
                    const reviewsData = Array.isArray(reviewsResponse)
                        ? reviewsResponse
                        : reviewsResponse.data || reviewsResponse.reviews || [];
                    setReviews(reviewsData);
                } catch (error) {
                    console.error('Error loading reviews:', error);
                    setReviews([]);
                }
            };

            // Load products and reviews in parallel
            await Promise.all([loadProducts(), loadReviews()]);

        } catch (error) {
            console.error('Error loading shop details:', error);
            // Show error message instead of mock data
            setShop(null);
            setProducts([]);
            setReviews([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookAppointment = () => {
        if (!user) {
            // Show a message or modal instead of redirecting immediately
            alert('يرجى تسجيل الدخول أولاً لحجز موعد');
            navigate(ROUTES.LOGIN);
            return;
        }
        navigate(ROUTES.BOOK_APPOINTMENT(id));
    };

    const handleAddToFavorites = async (productId) => {
        if (!user) {
            alert('يرجى تسجيل الدخول أولاً لإضافة المنتج للمفضلة');
            navigate(ROUTES.LOGIN);
            return;
        }

        if (!productId) {
            alert('حدث خطأ: معرف المنتج غير موجود');
            return;
        }

        try {
            await productService.addToFavorites(productId);

            // Update local state
            setProducts(prev => prev.map(product => {
                const currentProductId = product.id || product._id;
                return currentProductId === productId
                    ? { ...product, isFavorited: true }
                    : product;
            }));

            alert('تم إضافة المنتج للمفضلة بنجاح!');
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('حدث خطأ في إضافة المنتج للمفضلة');
        }
    };

   
    const ProductCard = ({ product }) => {
        const productId = product.id || product._id;

        // Debug: Log product data for troubleshooting
        console.log('🔍 ProductCard received:', {
            id: productId,
            name: product.name,
            price: product.price,
            priceType: typeof product.price,
            rating: product.rating,
            description: product.description
        });

        return (
            <Card
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => {
                    if (productId) {
                        navigate(ROUTES.PRODUCT_DETAILS(productId));
                    }
                }}
            >
                <div className="relative">
                    <img
                        src={product.image || product.imageUrl || product.images?.[0] || '/api/placeholder/300/300'}
                        alt={product.name || 'منتج'}
                        className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=منتج';
                        }}
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(productId);
                        }}
                    >
                        <Heart className={`w-4 h-4 ${product.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                </div>

                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-yellow-600 transition-colors">
                        {product.name || product.title || 'منتج غير محدد'}
                    </h3>

                    {product.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">
                                {typeof product.rating === 'number' ? product.rating.toFixed(1) : '0.0'}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                                ({product.reviewCount || product.reviews?.length || 0})
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-yellow-600">
                            {(() => {
                                // Handle different price formats
                                let price = product.price;

                                if (typeof price === 'object' && price !== null) {
                                    // If price is an object, try to extract the value
                                    price = price.value || price.amount || price.price || 0;
                                }

                                if (typeof price === 'string') {
                                    // If price is a string, try to parse it
                                    price = parseFloat(price) || 0;
                                }

                                if (typeof price === 'number' && price > 0) {
                                    return price.toLocaleString();
                                }

                                return 'غير محدد';
                            })()} ج.م
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (productId) {
                                    navigate(ROUTES.PRODUCT_DETAILS(productId));
                                }
                            }}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            عرض
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل تفاصيل المتجر...</p>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏪</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">المتجر غير متاح</h2>
                    <p className="text-gray-600 mb-4">عذراً، هذا المتجر غير متاح حالياً أو في انتظار الموافقة من الإدارة</p>
                    <Button onClick={() => navigate(ROUTES.SHOPS)}>
                        العودة للمتاجر
                    </Button>
                </div>
            </div>
        );
    }

    // Ensure shop has required properties to prevent errors
    const safeShop = {
        name: shop.name || 'متجر غير محدد',
        description: shop.description || 'لا يوجد وصف متاح',
        address: shop.address || 'العنوان غير محدد',
        phone: shop.phone || 'غير محدد',
        rating: shop.rating || 0,
        specialties: Array.isArray(shop.specialties) ? shop.specialties : [],
        workingHours: shop.workingHours || 'غير محدد',
        gallery: Array.isArray(shop.gallery) ? shop.gallery : [],
        image: shop.image || '/placeholder-shop.jpg',
        ...shop
    };



    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 p-0 h-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        العودة
                    </Button>
                    <span>/</span>
                    <span onClick={() => navigate(ROUTES.SHOPS)} className="cursor-pointer hover:text-yellow-600">
                        المتاجر
                    </span>
                    <span>/</span>
                    <span className="text-gray-900">{safeShop.name}</span>
                </div>

                {/* Shop Header */}
                <div className="bg-white rounded-lg shadow-sm mb-8">
                    <div className="relative h-64 md:h-80">
                        <img
                            src={safeShop.image}
                            alt={safeShop.name}
                            className="w-full h-full object-cover rounded-t-lg"
                            onError={(e) => {
                                e.target.src = '/placeholder-shop.jpg';
                            }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-lg"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold">{safeShop.name}</h1>
                                {safeShop.verified && (
                                    <Badge className="bg-green-500">
                                        متجر موثق
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-lg font-medium ml-1">
                                        {safeShop.rating ? safeShop.rating.toFixed(1) : '0.0'}
                                    </span>
                                    <span className="text-sm ml-1">
                                        ({safeReviews.length} تقييم)
                                    </span>
                                </div>
                                <span className="text-sm">
                                    منذ {safeShop.established || safeShop.createdAt ?
                                        new Date(safeShop.established || safeShop.createdAt).getFullYear() :
                                        'غير محدد'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">{safeShop.address}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">{safeShop.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <span className="text-gray-700">{safeShop.workingHours}</span>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6 leading-relaxed">
                            {safeShop.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {safeShop.specialties && safeShop.specialties.length > 0 ? (
                                safeShop.specialties.map((specialty, index) => (
                                    <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                                        {specialty}
                                    </Badge>
                                ))
                            ) : (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                    لا توجد تخصصات محددة
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                onClick={handleBookAppointment}
                                className="flex-1 sm:flex-none"
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                                حجز موعد
                            </Button>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {safeProducts.length}
                                    </div>
                                    <div className="text-sm text-gray-600">منتج</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {safeShop.customersCount || safeShop.customerCount || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">عميل</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {safeReviews.length}
                                    </div>
                                    <div className="text-sm text-gray-600">تقييم</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="products">
                            المنتجات ({safeProducts.length})
                        </TabsTrigger>
                        <TabsTrigger value="reviews">
                            التقييمات ({safeReviews.length})
                        </TabsTrigger>
                        <TabsTrigger value="gallery">
                            معرض الصور {safeShop.gallery?.length ? `(${safeShop.gallery.length})` : ''}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">منتجات المتجر</h2>
                            <div className="flex border rounded-lg">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-r-none"
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-l-none"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {safeProducts.length > 0 ? (
                            <div>
                                <div className="mb-4 text-sm text-gray-600">
                                    عرض {safeProducts.length} منتج من متجر {safeShop.name}
                                </div>
                                <div className={`grid gap-6 ${viewMode === 'grid'
                                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    : 'grid-cols-1'
                                    }`}>
                                    {safeProducts.map((product) => {
                                        const productKey = product.id || product._id || Math.random();
                                        return (
                                            <ProductCard key={productKey} product={product} />
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد منتجات في هذا المتجر
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    لم يتم إضافة منتجات لمتجر "{safeShop.name}" بعد
                                </p>
                                {user?.role === 'admin' || user?.id === safeShop.ownerId ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(ROUTES.PRODUCTS_CREATE)}
                                    >
                                        إضافة منتج جديد
                                    </Button>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        تواصل مع صاحب المتجر لإضافة منتجات
                                    </p>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-6">
                        <h2 className="text-2xl font-bold">تقييمات العملاء</h2>

                        {safeReviews.length > 0 ? (
                            <div className="space-y-6">
                                {safeReviews.map((review) => (
                                    <Card key={review.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-medium">{review.userName}</span>
                                                        {review.verified && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                عميل موثق
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < review.rating
                                                                    ? 'fill-yellow-400 text-yellow-400'
                                                                    : 'text-gray-300'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">{review.date}</span>
                                            </div>
                                            <p className="text-gray-700">{review.comment}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">⭐</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد تقييمات
                                </h3>
                                <p className="text-gray-600">
                                    لم يتم تقييم هذا المتجر بعد
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="gallery" className="space-y-6">
                        <h2 className="text-2xl font-bold">معرض صور المتجر</h2>

                        {safeShop.gallery && safeShop.gallery.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {safeShop.gallery.map((image, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-lg">
                                        <img
                                            src={image}
                                            alt={`${safeShop.name} - صورة ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                            onClick={() => {
                                                // يمكن إضافة modal لعرض الصورة بحجم كبير
                                                window.open(image, '_blank');
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <div className="text-6xl mb-4">📸</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد صور في المعرض
                                </h3>
                                <p className="text-gray-600">
                                    لم يتم إضافة صور لمعرض المتجر بعد
                                </p>
                                {user?.role === 'admin' || user?.id === safeShop.ownerId && (
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => navigate(ROUTES.EDIT_SHOP)}
                                    >
                                        إضافة صور للمعرض
                                    </Button>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ShopDetails;
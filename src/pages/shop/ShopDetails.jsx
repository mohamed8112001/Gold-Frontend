import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
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
    ShoppingBag,
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
                    (!shopData.hasOwnProperty('status') &&
                        !shopData.hasOwnProperty('approved') &&
                        !shopData.hasOwnProperty('isActive') &&
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

                setShop(shopData);
            } catch (shopError) {
                console.error('Error loading shop details:', shopError);
                setShop(null);
            }

            // Load shop products - parallel loading
            const loadProducts = async () => {
                try {
                    const productsResponse = await productService.getProductsByShop(id);
                    const productsData = Array.isArray(productsResponse)
                        ? productsResponse
                        : productsResponse.data || productsResponse.products || [];
                    setProducts(productsData);
                } catch (error) {
                    console.error('Error loading products:', error);
                    // Try fallback with getAllProducts and shopId param
                    try {
                        const fallbackResponse = await productService.getAllProducts({ shopId: id });
                        const fallbackData = Array.isArray(fallbackResponse)
                            ? fallbackResponse
                            : fallbackResponse.data || fallbackResponse.products || [];

                        // Filter products by shopId if needed
                        const filteredProducts = fallbackData.filter(product =>
                            product.shopId === parseInt(id) || product.shop_id === parseInt(id)
                        );
                        setProducts(filteredProducts);
                    } catch (fallbackError) {
                        console.error('Fallback products loading failed:', fallbackError);
                        setProducts([]); // Use empty array instead of mock data
                    }
                }
            };

            // Load shop reviews - parallel loading
            const loadReviews = async () => {
                try {
                    console.log('Loading reviews for shop ID:', id);
                    const reviewsResponse = await rateService.getAllRates({ shopId: id });
                    const reviewsData = Array.isArray(reviewsResponse)
                        ? reviewsResponse
                        : reviewsResponse.data || reviewsResponse.reviews || [];
                    console.log('Reviews loaded:', reviewsData.length);
                    setReviews(reviewsData);
                } catch (error) {
                    console.error('Error loading reviews:', error);
                    // Set empty array instead of mock data to avoid errors
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
            // Show a message or modal instead of redirecting immediately
            alert('يرجى تسجيل الدخول أولاً لإضافة المنتج للمفضلة');
            navigate(ROUTES.LOGIN);
            return;
        }

        try {
            await productService.addToFavorites(productId);
            // Update local state
            setProducts(prev => prev.map(product =>
                product.id === productId
                    ? { ...product, isFavorited: true }
                    : product
            ));
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('حدث خطأ في إضافة المنتج للمفضلة');
        }
    };

    // Mock data for demo
    const mockShop = {
        id: parseInt(id),
        name: 'مجوهرات الإسكندرية',
        description: 'متجر مجوهرات فاخر متخصص في الذهب والمجوهرات الثمينة منذ عام 1985. نقدم أجود أنواع الذهب والمجوهرات بأسعار تنافسية وخدمة عملاء ممتازة.',
        address: 'شارع فؤاد، الإسكندرية، مصر',
        phone: '+20 3 123 4567',
        email: 'info@alexandria-jewelry.com',
        rating: 4.7,
        reviewCount: 156,
        workingHours: 'السبت - الخميس: 10:00 ص - 10:00 م',
        image: '/api/placeholder/800/400',
        gallery: [
            '/api/placeholder/400/300',
            '/api/placeholder/400/300',
            '/api/placeholder/400/300',
            '/api/placeholder/400/300'
        ],
        specialties: ['خواتم الخطوبة', 'السلاسل الذهبية', 'الأساور', 'الأقراط'],
        established: '1985',
        verified: true,
        productsCount: 45,
        customersCount: 1200
    };

    const mockProducts = [
        {
            id: 1,
            name: 'خاتم ذهبي كلاسيكي',
            price: 2500,
            image: '/api/placeholder/300/300',
            rating: 4.5,
            reviewCount: 23,
            isFavorited: false,
            category: 'rings'
        },
        {
            id: 2,
            name: 'سلسلة ذهبية فاخرة',
            price: 4200,
            image: '/api/placeholder/300/300',
            rating: 4.8,
            reviewCount: 45,
            isFavorited: true,
            category: 'chains'
        },
        {
            id: 3,
            name: 'أسورة ذهبية مرصعة',
            price: 3800,
            image: '/api/placeholder/300/300',
            rating: 4.3,
            reviewCount: 18,
            isFavorited: false,
            category: 'bracelets'
        },
        {
            id: 4,
            name: 'أقراط ذهبية أنيقة',
            price: 2200,
            image: '/api/placeholder/300/300',
            rating: 4.6,
            reviewCount: 31,
            isFavorited: false,
            category: 'earrings'
        }
    ];

    const mockReviews = [
        {
            id: 1,
            userName: 'أحمد محمد',
            rating: 5,
            comment: 'متجر ممتاز وخدمة رائعة، أنصح بالتعامل معهم',
            date: '2024-01-10',
            verified: true
        },
        {
            id: 2,
            userName: 'فاطمة علي',
            rating: 4,
            comment: 'جودة عالية وأسعار مناسبة',
            date: '2024-01-08',
            verified: true
        },
        {
            id: 3,
            userName: 'محمود حسن',
            rating: 5,
            comment: 'تصاميم راقية وتعامل محترم',
            date: '2024-01-05',
            verified: false
        }
    ];

    const ProductCard = ({ product }) => {
        return (
            <Card className="group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                    <img
                        src={product.image || '/api/placeholder/300/300'}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(product.id);
                        }}
                    >
                        <Heart className={`w-4 h-4 ${product.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                </div>

                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-yellow-600 transition-colors">
                        {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">{product.rating}</span>
                            <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-yellow-600">
                            {product.price.toLocaleString()} ج.م
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(ROUTES.PRODUCT_DETAILS(product.id))}
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
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-t-lg"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold">{shop.name}</h1>
                                {shop.verified && (
                                    <Badge className="bg-green-500">
                                        متجر موثق
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-lg font-medium ml-1">{shop.rating}</span>
                                    <span className="text-sm ml-1">({shop.reviewCount} تقييم)</span>
                                </div>
                                <span className="text-sm">منذ {shop.established}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-500" />
                                <span>{shop.address}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-500" />
                                <span>{shop.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <span>{shop.workingHours}</span>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6 leading-relaxed">
                            {shop.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {shop.specialties && shop.specialties.length > 0 ? (
                                shop.specialties.map((specialty, index) => (
                                    <Badge key={index} variant="secondary">
                                        {specialty}
                                    </Badge>
                                ))
                            ) : (
                                <Badge variant="secondary">لا توجد تخصصات محددة</Badge>
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
                                    <div className="text-2xl font-bold text-yellow-600">{shop.productsCount}</div>
                                    <div className="text-sm text-gray-600">منتج</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">{shop.customersCount}</div>
                                    <div className="text-sm text-gray-600">عميل</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600">{shop.reviewCount}</div>
                                    <div className="text-sm text-gray-600">تقييم</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="products">المنتجات ({products.length})</TabsTrigger>
                        <TabsTrigger value="reviews">التقييمات ({reviews.length})</TabsTrigger>
                        <TabsTrigger value="gallery">معرض الصور</TabsTrigger>
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
                            <div className={`grid gap-6 ${viewMode === 'grid'
                                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-1'
                                }`}>
                                {safeProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد منتجات
                                </h3>
                                <p className="text-gray-600">
                                    لم يتم إضافة منتجات لهذا المتجر بعد
                                </p>
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

                        {shop.gallery && shop.gallery.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {shop.gallery.map((image, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                        <img
                                            src={image}
                                            alt={`${shop.name} - صورة ${index + 1}`}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📸</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد صور
                                </h3>
                                <p className="text-gray-600">
                                    لم يتم إضافة صور لمعرض المتجر بعد
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default ShopDetails;
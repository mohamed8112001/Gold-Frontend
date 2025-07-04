import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import {
    ArrowLeft,
    Heart,
    Star,
    ShoppingBag,
    MapPin,
    Phone,
    Clock,
    Share2,
    Eye,
    Calendar
} from 'lucide-react';
import { productService } from '../../services/productService.js';
import { shopService } from '../../services/shopService.js';
import { rateService } from '../../services/rateService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, PRODUCT_CATEGORIES } from '../../utils/constants.js';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [shop, setShop] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorited, setIsFavorited] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        loadProductDetails();
    }, [id]);

    const loadProductDetails = async () => {
        try {
            setIsLoading(true);

            // Load product details
            const productResponse = await productService.getProduct(id);
            const productData = productResponse.data || productResponse;
            setProduct(productData);

            // Load shop details
            if (productData.shopId) {
                const shopResponse = await shopService.getShop(productData.shopId);
                setShop(shopResponse.data || shopResponse);
            }

            // Load reviews (if available)
            try {
                const reviewsResponse = await rateService.getAllRates({ productId: id });
                setReviews(reviewsResponse.data || []);
            } catch (error) {
                console.log('Reviews not available');
            }

        } catch (error) {
            console.error('Error loading product details:', error);
            // Use mock data for demo
            setProduct(mockProduct);
            setShop(mockShop);
            setReviews(mockReviews);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToFavorites = async () => {
        if (!user) {
            navigate(ROUTES.LOGIN);
            return;
        }

        try {
            if (isFavorited) {
                await productService.removeFromFavorites(id);
                setIsFavorited(false);
            } else {
                await productService.addToFavorites(id);
                setIsFavorited(true);
            }
        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    };

    const handleBookAppointment = () => {
        if (!user) {
            navigate(ROUTES.LOGIN);
            return;
        }
        navigate(ROUTES.BOOK_APPOINTMENT(product.shopId));
    };

    // Mock data for demo
    const mockProduct = {
        id: parseInt(id),
        name: 'خاتم ذهبي كلاسيكي فاخر',
        description: 'خاتم ذهب عيار 21 بتصميم كلاسيكي أنيق مصنوع بعناية فائقة من أجود أنواع الذهب. يتميز بتصميم راقي يناسب جميع المناسبات الخاصة.',
        price: 2500,
        category: 'rings',
        images: [
            '/api/placeholder/600/600',
            '/api/placeholder/600/600',
            '/api/placeholder/600/600'
        ],
        rating: 4.5,
        reviewCount: 23,
        shopId: 1,
        shopName: 'مجوهرات الإسكندرية',
        specifications: {
            'العيار': '21 قيراط',
            'الوزن': '5.2 جرام',
            'المقاس': 'قابل للتعديل',
            'المادة': 'ذهب خالص',
            'بلد المنشأ': 'مصر'
        },
        features: [
            'تصميم كلاسيكي أنيق',
            'ذهب عيار 21 قيراط',
            'صناعة يدوية فاخرة',
            'ضمان لمدة سنتين',
            'قابل للتعديل والتخصيص'
        ],
        availability: 'متوفر',
        createdAt: '2024-01-15'
    };

    const mockShop = {
        id: 1,
        name: 'مجوهرات الإسكندرية',
        description: 'متجر مجوهرات فاخر متخصص في الذهب والمجوهرات الثمينة',
        address: 'شارع فؤاد، الإسكندرية',
        phone: '+20 3 123 4567',
        rating: 4.7,
        reviewCount: 156,
        workingHours: 'السبت - الخميس: 10:00 ص - 10:00 م',
        image: '/api/placeholder/400/300'
    };

    const mockReviews = [
        {
            id: 1,
            userName: 'أحمد محمد',
            rating: 5,
            comment: 'منتج رائع وجودة ممتازة، أنصح بالشراء',
            date: '2024-01-10',
            verified: true
        },
        {
            id: 2,
            userName: 'فاطمة علي',
            rating: 4,
            comment: 'جميل جداً ولكن السعر مرتفع قليلاً',
            date: '2024-01-08',
            verified: true
        },
        {
            id: 3,
            userName: 'محمود حسن',
            rating: 5,
            comment: 'تصميم راقي وخدمة ممتازة من المتجر',
            date: '2024-01-05',
            verified: false
        }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل تفاصيل المنتج...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">المنتج غير موجود</h2>
                    <p className="text-gray-600 mb-4">لم يتم العثور على المنتج المطلوب</p>
                    <Button onClick={() => navigate(ROUTES.PRODUCTS)}>
                        العودة للمنتجات
                    </Button>
                </div>
            </div>
        );
    }

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
                    <span onClick={() => navigate(ROUTES.PRODUCTS)} className="cursor-pointer hover:text-yellow-600">
                        المنتجات
                    </span>
                    <span>/</span>
                    <span className="text-gray-900">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-lg overflow-hidden">
                            <img
                                src={product.images?.[selectedImage] || product.image || '/api/placeholder/600/600'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-yellow-500' : 'border-gray-200'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleAddToFavorites}
                                    className="flex-shrink-0"
                                >
                                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                                </Button>
                            </div>

                            {product.category && (
                                <Badge className="mb-4">
                                    {PRODUCT_CATEGORIES[product.category.toUpperCase()] || product.category}
                                </Badge>
                            )}

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(product.rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                    <span className="text-sm font-medium ml-2">{product.rating}</span>
                                    <span className="text-sm text-gray-500 ml-1">({product.reviewCount} تقييم)</span>
                                </div>
                            </div>

                            <div className="text-3xl font-bold text-yellow-600 mb-6">
                                {product.price.toLocaleString()} ج.م
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-6">
                                {product.description}
                            </p>

                            {/* Availability */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className={`w-3 h-3 rounded-full ${product.availability === 'متوفر' ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                <span className={`font-medium ${product.availability === 'متوفر' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {product.availability || 'متوفر'}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    onClick={handleBookAppointment}
                                    className="flex-1"
                                >
                                    <Calendar className="w-5 h-5 mr-2" />
                                    حجز موعد للمعاينة
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate(ROUTES.SHOP_DETAILS(product.shopId))}
                                >
                                    <ShoppingBag className="w-5 h-5 mr-2" />
                                    زيارة المتجر
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                >
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Specifications */}
                        {product.specifications && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>المواصفات</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="font-medium text-gray-700">{key}</span>
                                                <span className="text-gray-900">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>المميزات</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {product.features.map((feature, index) => (
                                            <li key={index} className="flex items-center">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reviews */}
                        <Card>
                            <CardHeader>
                                <CardTitle>التقييمات والمراجعات</CardTitle>
                                <CardDescription>
                                    {reviews.length} تقييم من العملاء
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{review.userName}</span>
                                                            {review.verified && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    مشتري موثق
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center mt-1">
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
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-2">⭐</div>
                                        <p className="text-gray-600">لا توجد تقييمات بعد</p>
                                        <p className="text-sm text-gray-500">كن أول من يقيم هذا المنتج</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Shop Info Sidebar */}
                    <div className="space-y-6">
                        {shop && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>معلومات المتجر</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <img
                                            src={shop.image}
                                            alt={shop.name}
                                            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                                        />
                                        <h3 className="font-semibold text-lg">{shop.name}</h3>
                                        <div className="flex items-center justify-center mt-2">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium ml-1">{shop.rating}</span>
                                            <span className="text-sm text-gray-500 ml-1">({shop.reviewCount})</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                            <span className="text-sm">{shop.address}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-sm">{shop.phone}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                            <span className="text-sm">{shop.workingHours}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Button
                                            className="w-full"
                                            onClick={() => navigate(ROUTES.SHOP_DETAILS(shop.id))}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            زيارة المتجر
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={handleBookAppointment}
                                        >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            حجز موعد
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Related Products */}
                        <Card>
                            <CardHeader>
                                <CardTitle>منتجات مشابهة</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <img
                                                src="/api/placeholder/80/80"
                                                alt="منتج مشابه"
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm mb-1">خاتم ذهبي مشابه</h4>
                                                <div className="flex items-center mb-1">
                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs ml-1">4.5</span>
                                                </div>
                                                <p className="text-sm font-semibold text-yellow-600">2,800 ج.م</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
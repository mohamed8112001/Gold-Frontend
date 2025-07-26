import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronRight, Share2 } from 'lucide-react';

// Import our components
import ProductImageGallery from '../../components/product/ProductImageGallery';
import ProductInfoCard from '../../components/product/ProductInfoCard';
import ProductDetailsTabs from '../../components/product/ProductDetailsTabs';
import ShopInfoSidebar from '../../components/product/ShopInfoSidebar';
import ShopChatInterface from '../../components/ui/shop_chat_interface';
import ProductRating from '../../components/rating/ProductRating';
// Import services
import { productService } from '../../services/productService.js';
import { shopService } from '../../services/shopService.js';
import { rateService } from '../../services/rateService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, PRODUCT_CATEGORIES } from '../../utils/constants.js';
import { translateProductCategory } from '../../lib/utils.js';

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
    const [mainImage, setMainImage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProductDetails();
    }, [id]);

    const loadProductDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🔍 جاري تحميل تفاصيل المنتج للمعرف:', id);
            const productResponse = await productService.getProduct(id);
            const productData = productResponse.data || productResponse;

            console.log('📦 تم تحميل بيانات المنتج:', productData);

            if (!productData) {
                throw new Error('المنتج غير موجود');
            }

            const processedProduct = {
                ...productData,
                name: productData.title || productData.name,
                price: parseFloat(productData.price?.$numberDecimal || productData.price || 0),
                weight: parseFloat(productData.weight?.$numberDecimal || productData.weight || 0),
                shopId: productData.shop?._id,
                shopName: productData.shop?.name,
                rating: productData.rating || productData.averageRating || 4.5,
                reviewCount: productData.reviewCount || 0,
                soldCount: productData.soldCount || 0,
                availability: 'متوفر',
                stock: productData.stock || 10,
                sku: productData._id?.slice(-8).toUpperCase() || 'غير متوفر',
                specifications: {
                    'العيار': productData.karat || 'غير متوفر',
                    'الوزن': `${productData.weight?.$numberDecimal || productData.weight || 'غير متوفر'} جرام`,
                    'الفئة': translateProductCategory(productData.category || productData.design_type, (key) => {
                        const categories = {
                            rings: 'خواتم',
                            necklaces: 'عقود',
                            bracelets: 'أساور',
                            earrings: 'أقراط',
                            chains: 'سلاسل',
                            pendants: 'معلقات',
                            sets: 'طقم',
                            watches: 'ساعات',
                            other: 'أخرى',
                        };
                        return categories[key?.toLowerCase()] || key || 'غير متوفر';
                    }) || 'غير متوفر',
                    'المعدن': 'ذهب',
                    'معرف المنتج': productData._id
                },
                features: [
                    'مجوهرات مصنوعة يدويًا',
                    `${productData.karat || 'عيار 18'} ذهب`,
                    'حرفية عالية الجودة',
                    'ضمان الجودة',
                    'مواد أصلية'
                ],
                tags: [
                    translateProductCategory(productData.category, (key) => {
                        const categories = {
                            rings: 'خواتم',
                            necklaces: 'عقود',
                            bracelets: 'أساور',
                            earrings: 'أقراط',
                            chains: 'سلاسل',
                            pendants: 'معلقات',
                            sets: 'طقم',
                            watches: 'ساعات',
                            other: 'أخرى',
                        };
                        return categories[key?.toLowerCase()] || key || 'مجوهرات';
                    }),
                    productData.karat || 'ذهب',
                    productData.design_type || 'فاخر'
                ].filter(Boolean),
                shippingInfo: {
                    freeShipping: true,
                    deliveryTime: '٢-٣ أيام عمل',
                    returnPolicy: 'إرجاع خلال ٣٠ يومًا'
                }
            };

            setProduct(processedProduct);

            const imageToShow = productData.logoUrl || (productData.images && productData.images[0]);
            if (imageToShow) {
                setMainImage(imageToShow);
            }

            if (productData.shop?._id) {
                console.log('🏪 جاري تحميل تفاصيل المتجر للمعرف:', productData.shop._id);
                try {
                    const shopResponse = await shopService.getShop(productData.shop._id);
                    const shopData = shopResponse.data || shopResponse;

                    console.log('🏪 تم تحميل بيانات المتجر:', shopData);

                    const processedShop = {
                        ...shopData,
                        rating: shopData.averageRating || shopData.rating || 4.0,
                        reviewCount: shopData.reviewCount || 0,
                        verified: shopData.isApproved || false,
                        established: new Date(shopData.createdAt).getFullYear().toString(),
                        badges: [
                            shopData.isApproved ? 'بائع مُعتمد' : 'بائع جديد',
                            shopData.subscriptionPlan || 'خطة أساسية'
                        ].filter(Boolean),
                        image: shopData.logoUrl ?
                            `${import.meta.env.VITE_API_BASE_URL}/shop-image/${shopData.logoUrl}` :
                            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format&q=60'
                    };

                    setShop(processedShop);
                } catch (shopError) {
                    console.error('❌ خطأ في تحميل تفاصيل المتجر:', shopError);
                }
            }

            try {
                console.log('⭐ جاري تحميل التقييمات للمنتج:', id);
                const reviewsResponse = await rateService.getAllRates({ productId: id });
                const reviewsData = reviewsResponse.data || reviewsResponse || [];

                const processedReviews = reviewsData.map(review => ({
                    ...review,
                    id: review._id || review.id,
                    userName: review.user?.name || review.userName || 'مستخدم غير مسجل',
                    userAvatar: review.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'مستخدم')}&background=random`,
                    date: new Date(review.createdAt || Date.now()).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }),
                    verified: review.verified || false,
                    helpful: review.helpful || Math.floor(Math.random() * 20)
                }));

                setReviews(processedReviews);
                console.log('⭐ تم تحميل التقييمات:', processedReviews.length);
            } catch (reviewError) {
                console.log('⭐ لا توجد تقييمات متاحة أو خطأ في التحميل:', reviewError.message);
                setReviews([]);
            }

            if (user) {
                try {
                    // مكان للتحقق من حالة المفضلة
                } catch (error) {
                    console.log('تعذر التحقق من حالة المفضلة');
                }
            }

        } catch (error) {
            console.error('❌ خطأ في تحميل تفاصيل المنتج:', error);
            setError(error.message || 'فشل في تحميل تفاصيل المنتج');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChat = () => {
        if (!user) {
            alert('يرجى تسجيل الدخول أولاً للدردشة مع المتجر');
            navigate(ROUTES.LOGIN);
            return;
        }
        setIsChatOpen(true);
    };

    const handleCloseChat = () => {
        setIsChatOpen(false);
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
            console.error('خطأ في تحديث المفضلة:', error);
            alert('خطأ في تحديث المفضلة. يرجى المحاولة مرة أخرى.');
        }
    };

    const handleBookAppointment = () => {
        if (!user) {
            navigate(ROUTES.LOGIN);
            return;
        }
        const shopId = product?.shopId || shop?.id || shop?._id;
        if (shopId) {
            navigate(ROUTES.BOOK_APPOINTMENT(shopId));
        } else {
            alert('معلومات المتجر غير متاحة للحجز');
        }
    };

    const handleVisitShop = () => {
        const shopId = product?.shopId || shop?.id || shop?._id;
        if (shopId) {
            navigate(ROUTES.SHOP_DETAILS(shopId));
        } else {
            alert('معلومات المتجر غير متاحة');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center" aria-live="polite">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-amber-500 border-r-amber-500 border-b-gray-200 border-l-gray-200 mx-auto mb-6"></div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">جاري تحميل تفاصيل المنتج...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center" aria-live="polite">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">المنتج غير موجود</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{error || 'لم يتم العثور على المنتج المطلوب'}</p>
                    <div className="flex gap-4 justify-center">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outline"
                            className="border-2 border-gray-300 dark:border-gray-600 hover:border-amber-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md px-4 py-2 transition-all duration-300"
                            aria-label="العودة"
                        >
                            العودة
                        </Button>
                        <Button
                            onClick={() => navigate(ROUTES.PRODUCTS)}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-md px-4 py-2 transition-all duration-300"
                        >
                            تصفح المنتجات
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 font-inter">
            {/* رأس الصفحة المحسن مع مسار التنقل */}
            <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-40">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 rounded-md px-3 py-2"
                            aria-label="العودة"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            العودة
                        </Button>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span
                            className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                            onClick={() => navigate(ROUTES.PRODUCTS)}
                        >
                            المنتجات
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-900 dark:text-white font-medium truncate">{product.name}</span>

                        <div className="ml-auto flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-all duration-300">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {/* علامات المنتج */}
                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                    {product.tags?.map((tag, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="capitalize bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-3 py-1 text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors duration-300"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12">
                    {/* صور المنتج */}
                    <ProductImageGallery
                        product={product}
                        mainImage={mainImage}
                        setMainImage={setMainImage}
                        selectedImage={selectedImage}
                        setSelectedImage={setSelectedImage}
                        className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6"
                    />

                    {/* معلومات المنتج */}
                    <ProductInfoCard
                        product={product}
                        shop={shop}
                        user={user}
                        isFavorited={isFavorited}
                        setIsFavorited={setIsFavorited}
                        onOpenChat={handleOpenChat}
                        onBookAppointment={handleBookAppointment}
                        onVisitShop={handleVisitShop}
                        onAddToFavorites={handleAddToFavorites}
                        className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6"
                    />
                </div>

                {/* تفاصيل المنتج ومعلومات المتجر */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2">
                        <ProductDetailsTabs
                            product={product}
                            reviews={reviews}
                            className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6"
                        />
                    </div>

                    {/* الشريط الجانبي لمعلومات المتجر */}
                    <div className="sticky top-24">
                        <ShopInfoSidebar
                            shop={shop}
                            onVisitShop={handleVisitShop}
                            onOpenChat={handleOpenChat}
                            className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6"
                        />
                    </div>
                </div>

                {/* قسم تقييم المنتج */}
                <div className="w-full">
                    <ProductRating productId={id} showForm={true} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6" />
                </div>
            </div>

            {/* واجهة الدردشة */}
            <ShopChatInterface
                isOpen={isChatOpen}
                onClose={handleCloseChat}
                shop={shop}
                user={user}
                product={product}
                className="chat-animation"
            />
        </div>
    );
};

export default ProductDetails;
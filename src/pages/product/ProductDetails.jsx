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
// Import services
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

            // Load product details
            console.log('🔍 Loading product details for ID:', id);
            const productResponse = await productService.getProduct(id);
            const productData = productResponse.data || productResponse;

            console.log('📦 Product data loaded:', productData);

            if (!productData) {
                throw new Error('Product not found');
            }

            // Process product data to match our component structure
            const processedProduct = {
                ...productData,
                name: productData.title || productData.name,
                price: parseFloat(productData.price?.$numberDecimal || productData.price || 0),
                weight: parseFloat(productData.weight?.$numberDecimal || productData.weight || 0),
                shopId: productData.shop?._id,
                shopName: productData.shop?.name,
                // Default values for missing fields
                rating: productData.rating || productData.averageRating || 4.5,
                reviewCount: productData.reviewCount || 0,
                soldCount: productData.soldCount || 0,
                availability: 'In Stock',
                stock: productData.stock || 10,
                sku: productData._id?.slice(-8).toUpperCase() || 'N/A',
                specifications: {
                    'Karat': productData.karat || 'N/A',
                    'Weight': `${productData.weight?.$numberDecimal || productData.weight || 'N/A'} grams`,
                    'Category': productData.category || productData.design_type || 'N/A',
                    'Material': 'Gold',
                    'ID': productData._id
                },
                features: [
                    'Handcrafted jewelry',
                    `${productData.karat || '18K'} gold quality`,
                    'Premium craftsmanship',
                    'Quality guarantee',
                    'Authentic materials'
                ],
                tags: [
                    productData.category || 'jewelry',
                    productData.karat || 'gold',
                    productData.design_type || 'luxury'
                ].filter(Boolean),
                shippingInfo: {
                    freeShipping: true,
                    deliveryTime: '2-3 business days',
                    returnPolicy: '30 days return'
                }
            };

            setProduct(processedProduct);

            // Set main image - prioritize logoUrl, then first image
            const imageToShow = productData.logoUrl || (productData.images && productData.images[0]);
            if (imageToShow) {
                setMainImage(imageToShow);
            }

            // Load shop details if shop ID exists
            if (productData.shop?._id) {
                console.log('🏪 Loading shop details for ID:', productData.shop._id);
                try {
                    const shopResponse = await shopService.getShop(productData.shop._id);
                    const shopData = shopResponse.data || shopResponse;

                    console.log('🏪 Shop data loaded:', shopData);

                    // Process shop data
                    const processedShop = {
                        ...shopData,
                        rating: shopData.averageRating || shopData.rating || 4.0,
                        reviewCount: shopData.reviewCount || 0,
                        verified: shopData.isApproved || false,
                        established: new Date(shopData.createdAt).getFullYear().toString(),
                        badges: [
                            shopData.isApproved ? 'Verified Seller' : 'New Seller',
                            shopData.subscriptionPlan || 'Basic Plan'
                        ].filter(Boolean),
                        image: shopData.logoUrl ?
                            `${import.meta.env.VITE_API_BASE_URL}/shop-image/${shopData.logoUrl}` :
                            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format&q=60'
                    };

                    setShop(processedShop);
                } catch (shopError) {
                    console.error('❌ Error loading shop details:', shopError);
                    // Continue without shop data
                }
            }

            // Load reviews if available
            try {
                console.log('⭐ Loading reviews for product:', id);
                const reviewsResponse = await rateService.getAllRates({ productId: id });
                const reviewsData = reviewsResponse.data || reviewsResponse || [];

                // Process reviews data
                const processedReviews = reviewsData.map(review => ({
                    ...review,
                    id: review._id || review.id,
                    userName: review.user?.name || review.userName || 'Anonymous',
                    userAvatar: review.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'User')}&background=random`,
                    date: new Date(review.createdAt || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }),
                    verified: review.verified || false,
                    helpful: review.helpful || Math.floor(Math.random() * 20)
                }));

                setReviews(processedReviews);
                console.log('⭐ Reviews loaded:', processedReviews.length);
            } catch (reviewError) {
                console.log('⭐ No reviews available or error loading:', reviewError.message);
                setReviews([]);
            }

            // Check if product is favorited (if user is logged in)
            if (user) {
                try {
                    // You can implement this check if you have a favorites API
                    // const favoritesResponse = await productService.checkFavorite(id);
                    // setIsFavorited(favoritesResponse.isFavorited);
                } catch (error) {
                    console.log('Could not check favorite status');
                }
            }

        } catch (error) {
            console.error('❌ Error loading product details:', error);
            setError(error.message || 'Failed to load product details');
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
            console.error('Error updating favorites:', error);
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
            <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] via-white to-[#FFF8E6] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#C37C00] border-t-transparent mx-auto mb-6"></div>
                    <p className="text-gray-600 text-lg">جاري تحميل تفاصيل المنتج...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The requested product could not be found'}</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => navigate(-1)} variant="outline">
                            العودة
                        </Button>
                        <Button onClick={() => navigate(ROUTES.PRODUCTS)} className="bg-yellow-500 hover:bg-yellow-600">
                            Browse Products
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] via-white to-[#FFF8E6]">
            {/* Enhanced Header with Breadcrumb */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 hover:bg-gray-50 transition-all duration-200 rounded-lg px-3 py-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            العودة
                        </Button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span
                            className="hover:text-yellow-600 cursor-pointer transition-colors"
                            onClick={() => navigate(ROUTES.PRODUCTS)}
                        >
                            Products
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium truncate">{product.name}</span>

                        <div className="ml-auto flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Product Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {product.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="capitalize">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                    {/* Product Images */}
                    <ProductImageGallery
                        product={product}
                        mainImage={mainImage}
                        setMainImage={setMainImage}
                        selectedImage={selectedImage}
                        setSelectedImage={setSelectedImage}
                    />

                    {/* Product Info */}
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
                    />
                </div>

                {/* Product Details and Shop Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ProductDetailsTabs
                            product={product}
                            reviews={reviews}
                        />
                    </div>

                    {/* Shop Info Sidebar */}
                    <div>
                        <ShopInfoSidebar
                            shop={shop}
                            onVisitShop={handleVisitShop}
                            onOpenChat={handleOpenChat}
                        />
                    </div>
                </div>
            </div>

            {/* Chat Interface */}
            <ShopChatInterface
                isOpen={isChatOpen}
                onClose={handleCloseChat}
                shop={shop}
                user={user}
                product={product}
            />
        </div>
    );
};

export default ProductDetails;
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

    const [mainImage, setMainImage] = useState('')

    useEffect(() => {
        loadProductDetails();
    }, [id]);


    const changeImage = (index) => {
        console.log(`change image clicked: ${index}`);
        console.log('Current mainImage:', mainImage);
        console.log('Product images:', product.images);
        console.log('Selected image:', product.images[index]);
        
        // Update the selected image index
        setSelectedImage(index);
        
        // Update the main image to show the selected thumbnail
        if (product.images && product.images[index]) {
            setMainImage(product.images[index]);
            console.log('New mainImage set to:', product.images[index]);
        }
    }

    const resetToLogo = () => {
        console.log('Resetting to logo image');
        setSelectedImage(-1); // No thumbnail selected
        setMainImage(product.logoUrl);
    }

    const loadProductDetails = async () => {
        try {
            setIsLoading(true);

            // Load product details
            const productResponse = await productService.getProduct(id);
            const productData = productResponse.data || productResponse;

            // Debug: Log product data to understand structure
            console.log('🔍 Product data loaded:', productData);
            console.log('🔍 Product price:', productData.price, typeof productData.price);
            console.log('🔍 Product rating:', productData.rating, typeof productData.rating);
            

            setProduct(productData);

            // Always start with the logoUrl as the main image
            if (productData.logoUrl) {
                setMainImage(productData.logoUrl);
            } else if (productData.images && productData.images.length > 0) {
                setMainImage(productData.images[0]);
            }

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
            setMainImage(mockProduct.logoUrl || mockProduct.images[0]); // Prioritize logoUrl
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
        console.log('add to Fav');
        
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

    // Default gold jewelry images
    const defaultGoldImages = [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&crop=center&auto=format&q=60',
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop&crop=center&auto=format&q=60',
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=600&fit=crop&crop=center&auto=format&q=60'
    ];

    // Mock data for demo
    const mockProduct = {
        id: parseInt(id),
        name: 'Classic Gold Ring',
        description: 'Elegant 21-karat gold ring with classic design, crafted with exceptional care from the finest gold. Features a sophisticated design suitable for all special occasions.',
        category: 'rings',
        logoUrl: 'default-gold-ring-logo.jpg', // Default logo image
        images: defaultGoldImages,
        rating: 4.5,
        reviewCount: 23,
        shopId: 1,
        shopName: 'Alexandria Jewelry',
        specifications: {
            'Karat': '21K',
            'Weight': '5.2 grams',
            'Size': 'Adjustable',
            'Material': 'Pure Gold',
            'Origin': 'Egypt'
        },
        features: [
            'Classic elegant design',
            '21-karat gold',
            'Handcrafted luxury',
            '2-year warranty',
            'Adjustable and customizable'
        ],
        availability: 'Available',
        createdAt: '2024-01-15'
    };

    const mockShop = {
        id: 1,
        name: 'Alexandria Jewelry',
        description: 'Luxury jewelry store specializing in gold and precious jewelry',
        address: 'Fouad Street, Alexandria',
        phone: '+20 3 123 4567',
        rating: 4.7,
        reviewCount: 156,
        workingHours: 'Saturday - Thursday: 10:00 AM - 10:00 PM',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center&auto=format&q=60'
    };

    const mockReviews = [
        {
            id: 1,
            userName: 'Ahmed Mohamed',
            rating: 5,
            comment: 'Excellent product with amazing quality, highly recommend!',
            date: '2024-01-10',
            verified: true
        },
        {
            id: 2,
            userName: 'Fatima Ali',
            rating: 4,
            comment: 'Very beautiful design and great craftsmanship',
            date: '2024-01-08',
            verified: true
        },
        {
            id: 3,
            userName: 'Mahmoud Hassan',
            rating: 5,
            comment: 'Elegant design and excellent service from the store',
            date: '2024-01-05',
            verified: false
        }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-4">The requested product could not be found</p>
                    <Button onClick={() => navigate(ROUTES.PRODUCTS)}>
                        Back to Products
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-8 max-w-7xl mx-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 hover:bg-white hover:shadow-sm transition-all duration-200 rounded-full px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <span className="text-gray-400">/</span>
                    <span onClick={() => navigate(ROUTES.PRODUCTS)} className="cursor-pointer hover:text-yellow-600 transition-colors">
                        Products
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-medium">{product.name || product.title || 'Untitled Product'}</span>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                        {/* Product Images */}
                        <div className="space-y-6">
                            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-xl">
                                <img
                                    src={mainImage ? `${import.meta.env.VITE_API_BASE_URL}/product-image/${mainImage}` : defaultGoldImages[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        console.log('Image failed to load:', e.target.src);
                                        e.target.src = defaultGoldImages[0];
                                    }}
                                    onLoad={() => {
                                        console.log('Main image loaded successfully:', mainImage);
                                    }}
                                />
                            </div>

                            {(product.logoUrl || (product.images && product.images.length > 0)) && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {/* Logo/Default Image Thumbnail */}
                                    {product.logoUrl && (
                                        <button
                                            onClick={resetToLogo}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === -1 ? 'border-yellow-500' : 'border-gray-200'}`}
                                        >
                                            <img
                                                src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${product.logoUrl}`}
                                                alt={`${product.name} Logo`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    )}
                                    
                                    {/* Additional Images Thumbnails */}
                                    {product.images && product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => changeImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-yellow-500' : 'border-gray-200'}`}
                                        >
                                            <img
                                                src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${product.images[index]}`}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-3xl p-8 shadow-xl">
                                <div className="flex items-start justify-between mb-4">
                                    <h1 className="text-4xl font-bold text-gray-900">
                                        {product.name || product.title || 'Untitled Product'}
                                    </h1>
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
                                                className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-sm font-medium ml-2">
                                            {typeof product.rating === 'number' ? product.rating.toFixed(1) : '0.0'}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({product.reviewCount || product.reviews?.length || 0} reviews)
                                        </span>
                                    </div>
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
                                        {product.availability || 'Available'}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        size="lg"
                                        onClick={handleBookAppointment}
                                        className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <Calendar className="w-5 h-5 mr-2" />
                                        Book Appointment
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => {
                                            console.log('🏪 Visit Shop button clicked from ProductDetails');
                                            console.log('🏪 Product shop ID:', product.shopId);
                                            console.log('🏪 Product shop data:', product.shop);

                                            const shopId = product.shopId || product.shop?._id || product.shop?.id;
                                            if (shopId) {
                                                console.log('🏪 Navigating to shop:', shopId);
                                                navigate(ROUTES.SHOP_DETAILS(shopId));
                                            } else {
                                                console.error('🏪 No shop ID found in product data');
                                                alert('Shop information not available');
                                            }
                                        }}
                                        className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-4 rounded-full font-semibold text-lg"
                                    >
                                        <ShoppingBag className="w-5 h-5 mr-2" />
                                        Visit Shop
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="border-2 border-gray-300 hover:border-gray-400 py-4 px-6 rounded-full"
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
                                <Card className="border-0 shadow-xl rounded-3xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-2xl font-bold">Specifications</CardTitle>
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
                                <Card className="border-0 shadow-xl rounded-3xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-2xl font-bold">Features</CardTitle>
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
                            <Card className="border-0 shadow-xl rounded-3xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-2xl font-bold">Reviews & Ratings</CardTitle>
                                    <CardDescription className="text-lg">
                                        {reviews.length} customer reviews
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
                                            <p className="text-gray-600">No reviews yet</p>
                                            <p className="text-sm text-gray-500">Be the first to review this product</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Shop Info Sidebar */}
                        <div className="space-y-6">
                            {shop && (
                                <Card className="border-0 shadow-xl rounded-3xl">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-2xl font-bold">Shop Information</CardTitle>
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
                                                onClick={() => {
                                                    console.log('🏪 Visit Shop button clicked from shop card');
                                                    console.log('🏪 Shop ID:', shop.id);
                                                    console.log('🏪 Shop data:', shop);

                                                    const shopId = shop.id || shop._id;
                                                    if (shopId) {
                                                        console.log('🏪 Navigating to shop:', shopId);
                                                        navigate(ROUTES.SHOP_DETAILS(shopId));
                                                    } else {
                                                        console.error('🏪 No shop ID found in shop data');
                                                        alert('Shop information not available');
                                                    }
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Visit Shop
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={handleBookAppointment}
                                            >
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Book Appointment
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Related Products - Hidden for now until we have real data */}
                            {false && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>منتجات مشابهة</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-500">
                                            <p>سيتم عرض المنتجات المشابهة قريباً</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
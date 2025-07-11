import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import {
    ArrowLeft,
    Star,
    MapPin,
    Phone,
    Clock,
    Calendar,
    Heart,
    Eye,
    Share2,
    Grid,
    List,
    Award,
    Users,
    ShoppingBag,
    Verified,
    X
} from 'lucide-react';
import { shopService } from '../../services/shopService.js';
import { productService } from '../../services/productService.js';
import { rateService } from '../../services/rateService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import MapDisplay from '../../components/ui/MapDisplay.jsx';
import GalleryUpload from '../../components/shop/GalleryUpload.jsx';

// WhatsApp Icon Component
const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
    </svg>
);

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
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadShopDetails = async () => {
        try {
            setIsLoading(true);
            console.log('🏪 Starting to load shop details for ID:', id);
            console.log('🏪 Current user:', user ? `${user.role} (${user.id})` : 'Not authenticated');

            // Load shop details - Try both endpoints and allow access based on user role
            try {
                let shopResponse;
                let shopData;
                let loadedSuccessfully = false;

                // Try authenticated endpoint first if user is logged in
                if (user) {
                    try {
                        console.log('🏪 Trying authenticated shop endpoint for shop:', id);
                        shopResponse = await shopService.getShop(id);
                        shopData = shopResponse.data || shopResponse;
                        console.log('🏪 Authenticated shop loaded:', shopData.name);
                        loadedSuccessfully = true;
                    } catch (authError) {
                        console.log('🏪 Authenticated endpoint failed:', authError.message);
                    }
                }

                // If authenticated failed or user not logged in, try public endpoint
                if (!loadedSuccessfully) {
                    try {
                        console.log('🏪 Trying public shop endpoint for shop:', id);
                        shopResponse = await shopService.getShop(id);
                        shopData = shopResponse.data || shopResponse;
                        console.log('🏪 Public shop loaded successfully:', shopData.name);
                        loadedSuccessfully = true;
                    } catch (publicError) {
                        console.log('🏪 Public endpoint also failed:', publicError.message);
                    }
                }

                // If both endpoints failed, show error
                if (!loadedSuccessfully) {
                    console.error('🏪 Both endpoints failed, shop not accessible');
                    console.error('🏪 Shop ID:', id);
                    console.error('🏪 User:', user ? `${user.role} - ${user.id}` : 'Not authenticated');
                    setShop(null);
                    return;
                }

                // Shop loaded successfully, now check access permissions
                console.log('🏪 Shop data loaded, checking permissions...');
                console.log('🏪 Shop approval status:', shopData.isApproved);
                console.log('🏪 User role:', user?.role);
                console.log('🏪 User ID:', user?.id);
                console.log('🏪 Shop owner:', shopData.owner);

                // Validate shop data
                if (!shopData || !shopData.name) {
                    console.error('🏪 Invalid shop data received:', shopData);
                    setShop(null);
                    return;
                }

                // Always allow access if we successfully loaded the shop data
                // The backend will handle the access control
                console.log('🏪 Shop loaded successfully, proceeding to display...');

                console.log(`images: ${shopData['images']}`);

                // Default gold shop image
                const defaultShopImage = shopData['images'][0];

                // Load gallery from localStorage
                let localGallery = [];
                try {
                    const galleryResponse = await shopService.getShopGallery(id);
                    if (galleryResponse.success && galleryResponse.data.length > 0) {
                        localGallery = galleryResponse.data;
                        console.log(`📁 Loaded ${localGallery.length} images from localStorage for shop ${id}`);
                    }
                } catch (galleryError) {
                    console.log('📁 No local gallery found or error loading:', galleryError.message);
                }

                // Ensure shop has all required fields
                const processedShopData = {
                    ...shopData,
                    rating: shopData.averageRating || shopData.rating || 0,
                    specialties: Array.isArray(shopData.specialties) ? shopData.specialties : [],
                    gallery: localGallery.length > 0 ? localGallery : (Array.isArray(shopData.gallery) ? shopData.gallery : []),
                    image: shopData.logoUrl || shopData.image || shopData.imageUrl || defaultShopImage
                };

                console.log('🏪 Processed shop data with gallery:', processedShopData);
                console.log(`📁 Final gallery has ${processedShopData.gallery.length} images`);
                setShop(processedShopData);
            } catch (shopError) {
                console.error('🏪 Error loading shop details:', shopError);
                console.error('🏪 Error details:', {
                    message: shopError.message,
                    status: shopError.response?.status,
                    data: shopError.response?.data,
                    shopId: id
                });
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
            alert('Please login first to book an appointment');
            navigate(ROUTES.LOGIN);
            return;
        }
        navigate(ROUTES.BOOK_APPOINTMENT(id));
    };

    const handleAddToFavorites = async (productId) => {
        if (!user) {
            alert('Please login first to add product to favorites');
            navigate(ROUTES.LOGIN);
            return;
        }

        if (!productId) {
            alert('Error: Product ID not found');
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

            alert('Product added to favorites successfully!');
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('Error adding product to favorites');
        }
    };

    const handleDeleteGalleryImage = async (imageName, index) => {
        if (!confirm('هل تريد حذف هذه الصورة من المعرض؟')) return;

        try {
            console.log('🗑️ Deleting gallery image:', imageName);
            await shopService.deleteGalleryImage(shop._id || shop.id, imageName);

            // Update local state
            setShop(prev => ({
                ...prev,
                gallery: prev.gallery.filter((_, i) => i !== index)
            }));

            alert('تم حذف الصورة بنجاح!');
        } catch (error) {
            console.error('Error deleting gallery image:', error);
            alert(error.message || 'حدث خطأ في حذف الصورة');
        }
    };


    const ProductCard = ({ product }) => {
        const productId = product.id || product._id;

        // Array of default gold jewelry images
        const defaultGoldImages = [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop&crop=center&auto=format&q=60', // Gold rings
            'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=300&fit=crop&crop=center&auto=format&q=60', // Gold necklace
            'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=300&fit=crop&crop=center&auto=format&q=60', // Gold earrings
            'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=300&fit=crop&crop=center&auto=format&q=60', // Gold bracelet
            'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=300&fit=crop&crop=center&auto=format&q=60'  // Gold jewelry set
        ];

        // Select a random default image based on product ID for consistency
        const defaultProductImage = defaultGoldImages[productId ? (productId.length % defaultGoldImages.length) : 0];

        return (
            <Card
                className="group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer overflow-hidden border-0 bg-white rounded-3xl shadow-lg h-[500px] flex flex-col"
                onClick={() => {
                    if (productId) {
                        navigate(ROUTES.PRODUCT_DETAILS(productId));
                    }
                }}
            >
                <div className="relative overflow-hidden h-64">
                    <img
                        src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${product.logoUrl}`}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    // onError={(e) => {
                    //     e.target.src = defaultProductImage;
                    // }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Favorite Button */}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full w-9 h-9 p-0 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(productId);
                        }}
                    >
                        <Heart className={`w-4 h-4 ${product.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </Button>

                    {/* Status Badge */}
                    <Badge
                        className="absolute top-3 left-3 bg-green-500 hover:bg-green-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                        Available
                    </Badge>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-yellow-600 transition-colors duration-300 line-clamp-2 leading-tight min-h-[56px]">
                                {product.name || product.title || 'Untitled Product'}
                            </h3>

                            {product.description && (
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 min-h-[40px]">
                                    {product.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-center py-2">
                            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-gray-800">
                                    {typeof product.rating === 'number' ? product.rating.toFixed(1) : '0.0'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    ({product.reviewCount || product.reviews?.length || 0})
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100">
                        <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-full py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (productId) {
                                    navigate(ROUTES.PRODUCT_DETAILS(productId));
                                }
                            }}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
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
                    <p className="text-gray-600">Loading shop details...</p>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏪</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Available</h2>
                    <p className="text-gray-600 mb-4">Sorry, this shop is currently unavailable or pending approval</p>
                    <Button onClick={() => navigate(ROUTES.SHOPS)}>
                        Back to Shops
                    </Button>
                </div>
            </div>
        );
    }

    // Default gold shop image
    const defaultShopImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&crop=center&auto=format&q=60';

    // Extract location data from GeoJSON format
    let latitude = null;
    let longitude = null;
    if (shop.location && shop.location.coordinates) {
        longitude = shop.location.coordinates[0];
        latitude = shop.location.coordinates[1];
    }

    // Ensure shop has required properties to prevent errors
    const safeShop = {
        name: shop.name || 'Unnamed Shop',
        description: shop.description || 'No description available',
        address: shop.address || 'Address not specified',
        phone: shop.phone || 'Not specified',
        whatsapp: shop.whatsapp || null,
        rating: shop.rating || 0,
        workingHours: shop.workingHours || 'Not specified',
        gallery: Array.isArray(shop.gallery) ? shop.gallery : [],
        image: shop.image || defaultShopImage,
        latitude: latitude,
        longitude: longitude,
        ...shop
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Enhanced Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 hover:bg-white hover:shadow-sm transition-all duration-200 rounded-full px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <Separator orientation="vertical" className="h-4" />
                    <span onClick={() => navigate(ROUTES.SHOPS)} className="cursor-pointer hover:text-yellow-600 transition-colors">
                        Shops
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-medium">{safeShop.name}</span>
                </div>

                {/* Enhanced Shop Header */}
                <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden mx-4 lg:mx-8">
                    {/* Hero Section */}
                    <div className="relative h-72 md:h-96">
                        <img
                            src={`${import.meta.env.VITE_API_BASE_URL}/shop-image/${safeShop.logoUrl}`}
                            alt={safeShop.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = defaultShopImage;
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                        {/* Action Buttons */}
                        <div className="absolute top-6 right-6 flex gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-white/90 hover:bg-white backdrop-blur-sm"
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-white/90 hover:bg-white backdrop-blur-sm"
                            >
                                <Heart className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Shop Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <div className="flex items-end justify-between">
                                <div className="text-white">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h1 className="text-4xl md:text-5xl font-bold">{safeShop.name}</h1>
                                        {safeShop.verified && (
                                            <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                                                <Verified className="w-3 h-3" />
                                                متجر موثق
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-6 text-white/90">
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${i < Math.floor(safeShop.rating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-white/40'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-lg font-semibold">
                                                {safeShop.rating ? safeShop.rating.toFixed(1) : '0.0'}
                                            </span>
                                            <span className="text-sm">
                                                ({safeReviews.length} تقييم)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Award className="w-4 h-4" />
                                            <span className="text-sm">
                                                منذ {safeShop.established || safeShop.createdAt ?
                                                    new Date(safeShop.established || safeShop.createdAt).getFullYear() :
                                                    'غير محدد'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Shop Info Section */}
                    <div className="p-8">
                        {/* Contact Information Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100 hover:shadow-lg transition-shadow rounded-2xl">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-blue-500 rounded-full">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium mb-1">Address</p>
                                        <p className="text-gray-800 font-semibold text-base">{safeShop.address}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:shadow-lg transition-shadow rounded-2xl">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500 rounded-full">
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-indigo-600 font-medium mb-1">Phone</p>
                                        <p className="text-gray-800 font-semibold text-base">
                                            <a href={`tel:${safeShop.phone}`} className="hover:text-indigo-600 transition-colors">
                                                {safeShop.phone}
                                            </a>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {safeShop.whatsapp && (
                                <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100 hover:shadow-lg transition-shadow rounded-2xl">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="p-3 bg-green-500 rounded-full">
                                            <WhatsAppIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-600 font-medium mb-1">WhatsApp</p>
                                            <p className="text-gray-800 font-semibold text-base">
                                                <a
                                                    href={`https://wa.me/${safeShop.whatsapp.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-green-600 transition-colors"
                                                >
                                                    {safeShop.whatsapp}
                                                </a>
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100 hover:shadow-lg transition-shadow rounded-2xl">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-purple-500 rounded-full">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium mb-1">Working Hours</p>
                                        <p className="text-gray-800 font-semibold text-base">{safeShop.workingHours}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Description */}
                        <div className="mb-10">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">About the Shop</h3>
                            <p className="text-gray-700 leading-relaxed text-xl bg-gray-50 p-6 rounded-2xl">
                                {safeShop.description}
                            </p>

</div>

                        {/* Action Section */}
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl">
                            <div className="flex gap-6">
                                <Button
                                    size="lg"
                                    onClick={handleBookAppointment}
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                                >
                                    <Calendar className="w-6 h-6 mr-3" />
                                    Book Appointment
                                </Button>

                            </div>

                            {/* Stats */}
                            <div className="flex gap-10">
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-3 shadow-lg">
                                        <ShoppingBag className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{safeProducts.length}</div>
                                    <div className="text-base text-gray-600 font-medium">Products</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-3 shadow-lg">
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {safeShop.customersCount || safeShop.customerCount || 0}
                                    </div>
                                    <div className="text-base text-gray-600 font-medium">Customers</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-3 shadow-lg">
                                        <Star className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{safeReviews.length}</div>
                                    <div className="text-base text-gray-600 font-medium">Reviews</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Shop Content Tabs */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mx-4 lg:mx-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-3 rounded-none h-auto">
                            <TabsTrigger
                                value="products"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
                            >
                                <ShoppingBag className="w-6 h-6 mr-3" />
                                Products ({safeProducts.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
                            >
                                <Star className="w-6 h-6 mr-3" />
                                Reviews ({safeReviews.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="location"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
                            >
                                <MapPin className="w-6 h-6 mr-3" />
                                Location
                            </TabsTrigger>
                            <TabsTrigger
                                value="gallery"
                                className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
                            >
                                <Eye className="w-6 h-6 mr-3" />
                                Gallery {safeShop.gallery?.length ? `(${safeShop.gallery.length})` : ''}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="products" className="p-6 lg:p-8">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Shop Products</h2>
                                    <p className="text-gray-600 text-lg">Discover our exclusive collection</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex bg-gray-100 rounded-full p-2">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                            size="lg"
                                            onClick={() => setViewMode('grid')}
                                            className={`rounded-full px-6 py-3 font-semibold ${viewMode === 'grid' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
                                        >
                                            <Grid className="w-5 h-5 mr-2" />
                                            Grid
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                                            size="lg"
                                            onClick={() => setViewMode('list')}
                                            className={`rounded-full px-6 py-3 font-semibold ${viewMode === 'list' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
                                        >
                                            <List className="w-5 h-5 mr-2" />
                                            List
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {safeProducts.length > 0 ? (
                                <div>
                                    <div className="mb-6 text-base text-gray-600 font-medium">
                                        Showing {safeProducts.length} products from {safeShop.name}
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

                        <TabsContent value="reviews" className="p-8">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">تقييمات العملاء</h2>
                                <p className="text-gray-600">اقرأ آراء عملائنا وتجاربهم معنا</p>
                            </div>

                            {safeReviews.length > 0 ? (
                                <div className="space-y-6">
                                    {safeReviews.map((review) => (
                                        <Card key={review.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
                                            <CardContent className="p-8">
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="w-12 h-12 border-2 border-gray-200">
                                                        <AvatarImage src={review.userAvatar} />
                                                        <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold">
                                                            {review.userName?.charAt(0) || 'ع'}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-bold text-lg text-gray-900">{review.userName}</span>
                                                                {review.verified && (
                                                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                                                        <Verified className="w-3 h-3 mr-1" />
                                                                        عميل موثق
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                                {review.date}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center mb-4">
                                                            <div className="flex mr-2">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-5 h-5 ${i < review.rating
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {review.rating}/5
                                                            </span>
                                                        </div>

                                                        <p className="text-gray-700 leading-relaxed text-lg">
                                                            "{review.comment}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                                    <div className="text-8xl mb-6">⭐</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        لا توجد تقييمات بعد
                                    </h3>
                                    <p className="text-gray-600 text-lg mb-6">
                                        كن أول من يقيم هذا المتجر ويشارك تجربته
                                    </p>
                                    <Button
                                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-full font-semibold"
                                    >
                                        اكتب تقييماً
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="location" className="p-8">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">موقع المتجر</h2>
                                <p className="text-gray-600">اعثر على المتجر واحصل على الاتجاهات</p>
                            </div>

                            <MapDisplay
                                latitude={safeShop.latitude}
                                longitude={safeShop.longitude}
                                shopName={safeShop.name}
                                shopAddress={safeShop.address}
                                height="400px"
                                showDirections={true}
                                showHeader={false}
                            />
                        </TabsContent>

                        <TabsContent value="gallery" className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">معرض صور المتجر</h2>
                                    <p className="text-gray-600">استكشف صور المتجر والأعمال المميزة</p>
                                </div>
                                {(user?.role === 'admin' || user?.id === safeShop.ownerId || user?._id === safeShop.ownerId) && (
                                    <GalleryUpload
                                        shopId={safeShop._id || safeShop.id}
                                        currentUser={user}
                                        onUploadSuccess={(newImages) => {
                                            console.log('🖼️ Gallery upload success, updating shop state with:', newImages);
                                            setShop(prev => ({
                                                ...prev,
                                                gallery: [...(prev.gallery || []), ...newImages]
                                            }));
                                            // Reload shop data to get updated gallery
                                            loadShopDetails();
                                        }}
                                    />
                                )}
                            </div>

                            {safeShop.gallery && safeShop.gallery.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {safeShop.gallery.map((image, index) => {
                                        // Handle both localStorage images (objects) and regular images (strings)
                                        const isLocalImage = typeof image === 'object' && image.data;
                                        const imageUrl = isLocalImage ? image.data : `${import.meta.env.VITE_API_BASE_URL}/shop-gallery/${image}`;
                                        const imageName = isLocalImage ? image.name : `صورة ${index + 1}`;
                                        const imageId = isLocalImage ? image.id : image;

                                        return (
                                            <div key={imageId} className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                                                <img
                                                    src={imageUrl}
                                                    alt={`${safeShop.name} - ${imageName}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center&auto=format&q=60';
                                                    }}
                                                    onClick={() => {
                                                        // فتح الصورة في نافذة جديدة
                                                        window.open(imageUrl, '_blank');
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <p className="text-sm font-medium">{imageName}</p>
                                                    {isLocalImage && (
                                                        <p className="text-xs text-gray-300">محفوظة محلياً</p>
                                                    )}
                                                </div>
                                                {(user?.role === 'admin' || user?.id === safeShop.ownerId || user?._id === safeShop.ownerId) && (
                                                    <button
                                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteGalleryImage(imageId, index);
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                                    <div className="text-8xl mb-6">📸</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        لا توجد صور في المعرض
                                    </h3>
                                    <p className="text-gray-600 text-lg mb-6">
                                        لم يتم إضافة صور لمعرض المتجر بعد
                                    </p>
                                    {(user?.role === 'admin' || user?.id === safeShop.ownerId || user?._id === safeShop.ownerId) && (
                                        <GalleryUpload
                                            shopId={safeShop._id || safeShop.id}
                                            currentUser={user}
                                            onUploadSuccess={(newImages) => {
                                                console.log('🖼️ Gallery upload success (empty state), updating shop state with:', newImages);
                                                setShop(prev => ({
                                                    ...prev,
                                                    gallery: [...(prev.gallery || []), ...newImages]
                                                }));
                                                // Reload shop data to get updated gallery
                                                loadShopDetails();
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default ShopDetails;
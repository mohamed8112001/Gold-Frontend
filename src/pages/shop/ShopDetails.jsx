import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
    ArrowLeft,
    Star,
    MapPin,
    Calendar,
    Heart,
    Eye,
    ChevronLeft,
    ChevronRight,
    Phone,
    Clock,
    Shield,
    ShoppingBag,
    Grid,
    List,
    X
} from 'lucide-react';
import { shopService } from '../../services/shopService';
import { productService } from '../../services/productService';
import { ROUTES } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import MapDisplay from '../../components/ui/MapDisplay.jsx';
import GalleryUpload from '../../components/shop/GalleryUpload.jsx';

// WhatsApp Icon Component
const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
    </svg>
);

// Shop Image Slider Component
const ShopImageSlider = ({ images = [], shopName }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const validImages = Array.isArray(images)
        ? images.filter(img => img && typeof img === 'string' && img.trim() !== '')
        : [];
    const displayImages = validImages.length > 0
        ? validImages
        : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&crop=center&auto=format&q=80'];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % displayImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    useEffect(() => {
        if (displayImages.length <= 1) return; // Skip auto-slide if only one image
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [displayImages.length]);

    return (
        <div className="relative w-full h-full overflow-hidden">
            {displayImages.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <img
                        src={image}
                        alt={`${shopName} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=600&fit=crop&crop=center&auto=format&q=80';
                        }}
                    />
                </div>
            ))}

            {displayImages.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm z-20"
                        aria-label="Previous Slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm z-20"
                        aria-label="Next Slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                        {displayImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const ShopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [viewMode, setViewMode] = useState('grid');
    const { t } = useTranslation();

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
            console.log('🔄 Loading shop details for ID:', id);

            // Load shop details
            const shopResponse = await shopService.getShop(id);
            const shopData = shopResponse.data || shopResponse;

            if (shopData) {
                setShop(shopData);
            }

            // Load products
            try {
                const productsResponse = await productService.getProductsByShop(id);
                const productsData = Array.isArray(productsResponse)
                    ? productsResponse
                    : productsResponse.data || [];
                setProducts(productsData);
            } catch (error) {
                console.error('Error loading products:', error);
                setProducts([]);
            }

        } catch (error) {
            console.error('❌ Error loading shop details:', error);
            setShop(null);
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

        try {
            await productService.addToFavorites(productId);
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

    // Product Card Component
    const ProductCard = ({ product }) => {
        const productId = product.id || product._id;

        const defaultGoldImages = [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop&crop=center&auto=format&q=60',
            'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=300&fit=crop&crop=center&auto=format&q=60',
            'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=300&fit=crop&crop=center&auto=format&q=60',
            'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=300&fit=crop&crop=center&auto=format&q=60',
            'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=300&fit=crop&crop=center&auto=format&q=60'
        ];

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
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.src = defaultProductImage;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

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

                    <Badge className="absolute top-3 left-3 bg-[#C37C00] hover:bg-[#A66A00] text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                        Available
                    </Badge>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#C37C00] transition-colors duration-300 line-clamp-2 leading-tight min-h-[56px]">
                                {product.name || product.title || 'Untitled Product'}
                            </h3>

                            {product.description && (
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 min-h-[40px]">
                                    {product.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-center py-2">
                            <div className="flex items-center gap-2 bg-[#F8F4ED] px-4 py-2 rounded-full border border-[#E2D2B6]/50">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                                                ? 'fill-[#C37C00] text-[#C37C00]'
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
                            className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-full py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
            <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                        <span className="text-white text-2xl">💎</span>
                    </div>
                    <p className="text-[#C37C00] font-semibold text-lg">Loading shop details...</p>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🏪</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop Not Found</h2>
                    <p className="text-gray-600 mb-6">The shop you're looking for doesn't exist or has been removed.</p>
                    <Button
                        onClick={() => navigate(ROUTES.SHOPS)}
                        className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3 rounded-full font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Shops
                    </Button>
                </div>
            </div>
        );
    }

    const safeShop = {
        name: shop.name || 'Unnamed Shop',
        description: shop.description || 'No description available',
        logoUrl: shop.logoUrl || '',
        images: shop.images || shop.gallery || [],
        address: shop.address || '',
        phone: shop.phone || '',
        whatsapp: shop.whatsapp || '',
        workingHours: shop.workingHours || 'Daily 9:00 AM - 10:00 PM',
        rating: shop.averageRating || shop.rating || 0,
        verified: shop.verified || false,
        status: shop.status || 'active',
        ownerName: shop.ownerName || 'Shop Owner',
        latitude: shop.location?.coordinates?.[1] || null,
        longitude: shop.location?.coordinates?.[0] || null,
        ...shop
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB]">
            {/* Back Button */}
            <div className="relative z-50 pt-20 pb-4 px-4 sm:px-6 lg:px-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="bg-white/90 hover:bg-white text-[#C37C00] border border-[#C37C00]/30 backdrop-blur-md transition-all duration-300 rounded-full px-6 py-2 shadow-lg hover:shadow-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shops
                </Button>
            </div>

            {/* Image Slider */}
            <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
                <ShopImageSlider
                    images={(() => {
                        const shopImages = [];
                        if (safeShop.logoUrl) {
                            shopImages.push(`${import.meta.env.VITE_API_BASE_URL}/shop-image/${safeShop.logoUrl}`);
                        }
                        if (Array.isArray(safeShop.gallery)) {
                            safeShop.gallery.forEach((img) => {
                                if (img && typeof img === 'string' && img.trim() !== '') {
                                    shopImages.push(`${import.meta.env.VITE_API_BASE_URL}/shop-image/${img}`);
                                }
                            });
                        }
                        if (Array.isArray(safeShop.images)) {
                            safeShop.images.forEach((img) => {
                                if (img && typeof img === 'string' && img.trim() !== '') {
                                    shopImages.push(`${import.meta.env.VITE_API_BASE_URL}/shop-image/${img}`);
                                }
                            });
                        }
                        return shopImages;
                    })()}
                    shopName={safeShop.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>

                {/* Shop Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-end justify-between">
                        <div className="text-white">
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-4xl md:text-5xl font-bold">{safeShop.name}</h1>
                                {safeShop.verified && (
                                    <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Verified
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
                                                    ? 'fill-[#C37C00] text-[#C37C00]'
                                                    : 'text-white/40'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-lg font-semibold">
                                        {safeShop.rating ? safeShop.rating.toFixed(1) : '0.0'}
                                    </span>
                                    <span className="text-sm">
                                        ({safeReviews.length} reviews)
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-sm">
                                        Since {safeShop.established || safeShop.createdAt ?
                                            new Date(safeShop.established || safeShop.createdAt).getFullYear() :
                                            'N/A'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Info Section */}
            <div className="bg-white shadow-xl mb-8 overflow-hidden">
                <div className="p-8">
                    {/* Contact Information Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <Card className="border-0 bg-gradient-to-r from-[#F0E8DB] to-[#E2D2B6] hover:shadow-lg transition-shadow rounded-2xl">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-[#C37C00] rounded-full">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#C37C00] font-medium mb-1">Address</p>
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
                                        <a
                                            href={`tel:${safeShop.phone}`}
                                            className="hover:text-indigo-600 transition-colors"
                                        >
                                            {safeShop.phone}
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-gradient-to-r from-green-50 to-green-100 hover:shadow-lg transition-shadow rounded-2xl">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-green-500 rounded-full">
                                    <WhatsAppIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-600 font-medium mb-1">WhatsApp</p>
                                    <p className="text-gray-800 font-semibold text-base">
                                        <a
                                            href={`https://wa.me/${safeShop.whatsapp}`}
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
                        <div className="flex  justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                {t('shop_details.about_shop')}
                            </h3>
                            <Button
                                size="lg"
                                onClick={handleBookAppointment}
                                className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                            >
                                <Calendar className="w-6 h-6 mr-3" />
                                {t('shop_details.book_appointment')}
                            </Button>
                        </div>

                        <p className="text-gray-700 leading-relaxed text-xl bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB] p-6 rounded-2xl border border-[#E2D2B6]/30">
                            {safeShop.description}
                        </p>

                        {user?.role === 'user' && (
                            <div className="mt-6">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => navigate(`/shops/${safeShop._id || safeShop.id}/chat`)}
                                    className="border-2 border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] hover:border-[#A66A00] hover:text-[#A66A00] px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                                >
                                    <Bot className="w-6 h-6 mr-3" />
                                    {t('shop_details.chat_with_store')}
                                </Button>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Shop Content Tabs */}
            <div className="bg-white shadow-xl overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-[#F8F4ED] to-[#F0E8DB] p-3 rounded-none h-auto border-b border-[#E2D2B6]/30">
                        <TabsTrigger
                            value="products"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
                        >
                            <ShoppingBag className="w-6 h-6 mr-3" />
                            {t('shop_details.products')} ({safeProducts.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="reviews"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
                        >
                            <Star className="w-6 h-6 mr-3" />
                            {t('shop_details.reviews')} ({safeReviews.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="location"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
                        >
                            <ShoppingBag className="w-6 h-6 mr-3" />
                            {t('shop_details.location')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="gallery"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
                        >
                            <Eye className="w-6 h-6 mr-3" />
                            {t('shop_details.gallery')} {safeShop.gallery?.length ? `(${safeShop.gallery.length})` : ''}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-3">Shop Products</h2>
                                <p className="text-gray-600 text-lg">Discover our exclusive collection</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex bg-[#F0E8DB] rounded-full p-2 border border-[#E2D2B6]/50">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="lg"
                                        onClick={() => setViewMode('grid')}
                                        className={`rounded-full px-6 py-3 font-semibold ${viewMode === 'grid' ? 'bg-white shadow-lg text-[#8A6C37]' : 'hover:bg-[#E2D2B6] text-gray-600'}`}
                                    >
                                        <Grid className="w-5 h-5 mr-2" />
                                        Grid
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="lg"
                                        onClick={() => setViewMode('list')}
                                        className={`rounded-full px-6 py-3 font-semibold ${viewMode === 'list' ? 'bg-white shadow-lg text-[#8A6C37]' : 'hover:bg-[#E2D2B6] text-gray-600'}`}
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
                            <div className="text-center py-12 bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB] rounded-lg border border-[#E2D2B6]/30">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    No products available in this shop
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    No products have been added to "{safeShop.name}" yet
                                </p>
                                {user?.role === 'admin' || user?.id === safeShop.ownerId || user?._id === safeShop.ownerId ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate(ROUTES.PRODUCTS_CREATE)}
                                    >
                                        Add New Product
                                    </Button>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        Contact the shop owner to request product additions
                                    </p>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="location" className="px-4 sm:px-6 lg:px-8 py-8">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop Location</h2>
                            <p className="text-gray-600">Find the shop and get directions</p>
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


                    <TabsContent value="reviews" className="px-4 sm:px-6 lg:px-8 py-8">
                        <div className="mb-8 ">
                            <h2 className="text-3xl flex-row font-bold text-gray-900 mb-2"> Customer Reviews</h2>
                            <p className="text-gray-600">Read what our customers have to say about their experience</p>
                        </div>

                        {safeReviews.length > 0 ? (
                            <div className="space-y-6">
                                {safeReviews.map((review) => (
                                    <Card key={review.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
                                        <CardContent className="p-8">
                                            <div className="flex items-start gap-4">
                                                <Avatar className="w-12 h-12 border-2 border-gray-200">
                                                    <AvatarImage src={review.userAvatar} />
                                                    <AvatarFallback className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white font-bold">
                                                        {review.userName?.charAt(0) || 'ع'}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-lg text-gray-900">{review.userName}</span>
                                                            {review.verified && (
                                                                <Badge className="bg-[#F0E8DB] text-[#6D552C] border-[#E2D2B6]">
                                                                    <Shield className="w-3 h-3 mr-1" />
                                                                    عميل موثق
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-500 bg-[#F0E8DB] px-3 py-1 rounded-full border border-[#E2D2B6]/50">
                                                            {review.date}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center mb-4">
                                                        <div className="flex mr-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-5 h-5 ${i < review.rating
                                                                        ? 'fill-[#C37C00] text-[#C37C00]'
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
                                    No reviews yet
                                </h3>
                                <p className="text-gray-600 text-lg mb-6">
                                    Be the first to review this shop and share your experience
                                </p>
                                <Button
                                    className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3 rounded-full font-semibold"
                                >
                                    Write a Review
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="gallery" className="px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-3">Shop Gallery</h2>
                                <p className="text-gray-600 text-lg">Explore high-quality photos of the shop and featured work</p>
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
                                        loadShopDetails();
                                    }}
                                />
                            )}
                        </div>


                        {safeShop.gallery && safeShop.gallery.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {safeShop.gallery.map((image, index) => {
                                    const isLocalImage = typeof image === 'object' && image.data;
                                    const imageUrl = isLocalImage ? image.data : `${import.meta.env.VITE_API_BASE_URL}/shop-gallery/${image}`;
                                    const imageName = isLocalImage ? image.name : `صورة ${index + 1}`;
                                    const imageId = isLocalImage ? image.id : image;

                                    return (
                                        <div key={imageId} className="group relative">
                                            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                                <img
                                                    src={imageUrl}
                                                    alt={`${safeShop.name} - ${imageName}`}
                                                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                                                    style={{
                                                        filter: 'brightness(1.05) contrast(1.1) saturate(1.15)',
                                                        imageRendering: 'crisp-edges'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center&auto=format&q=60';
                                                    }}
                                                    onClick={() => {
                                                        window.open(imageUrl, '_blank');
                                                    }}
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                                        <p className="font-bold text-lg mb-1">{imageName}</p>
                                                        <p className="text-sm text-white/80">Click to view full size</p>
                                                        {isLocalImage && (
                                                            <p className="text-xs text-[#C5A56D] mt-1">Saved locally</p>
                                                        )}
                                                    </div>

                                                    <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
                                                        <Eye className="w-5 h-5 text-white" />
                                                    </div>
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

                                            <div className="mt-4 text-center">
                                                <h3 className="font-semibold text-gray-900 text-lg">{imageName}</h3>
                                                <p className="text-gray-500 text-sm mt-1">Gallery {safeShop.name}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                                <div className="text-8xl mb-6">📸</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    No Images in the Gallery
                                </h3>
                                <p className="text-gray-600 text-lg mb-6">
                                    No images have been added to the shop's gallery yet
                                </p>
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
    );
};

export default ShopDetails;

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button.jsx';
// import { Card, CardContent } from '@/components/ui/card.jsx';
// import { Badge } from '@/components/ui/badge.jsx';
// import { useAuth } from '../../context/AuthContext.jsx';
// import { FaPhone, FaWhatsapp } from 'react-icons/fa';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
// import { Separator } from '@/components/ui/separator.jsx';
// import {
//     ArrowLeft,
//     Star,
//     MapPin,
//     Phone,
//     Clock,
//     Calendar,
//     Heart,
//     Eye,
//     Share2,
//     Grid,
//     List,
//     Award,
//     Users,
//     ShoppingBag,
//     Verified,
//     X,
//     Bot,
//     MessageSquare
// } from 'lucide-react';

// import { shopService } from '../../services/shopService.js';
// import { productService } from '../../services/productService.js';
// import { rateService } from '../../services/rateService.js';
// import { ROUTES, STORAGE_KEYS } from '../../utils/constants.js';
// import MapDisplay from '../../components/ui/MapDisplay.jsx';
// import GalleryUpload from '../../components/shop/GalleryUpload.jsx';
// import { useTranslation } from 'react-i18next';
// import chatService from '../../services/chatService.js';


// // WhatsApp Icon Component
// const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
//     <svg
//         className={className}
//         viewBox="0 0 24 24"
//         fill="currentColor"
//         xmlns="http://www.w3.org/2000/svg"
//     >
//         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488" />
//     </svg>
// );

// const ShopDetails = () => {
//     const { isShopOwner } = useAuth();

//     const { id } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const [shop, setShop] = useState(null);
//     const [products, setProducts] = useState([]);
//     const [reviews, setReviews] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState('products');
//     const [viewMode, setViewMode] = useState('grid');
//     const { t } = useTranslation();

//     const safeProducts = Array.isArray(products) ? products : [];
//     const safeReviews = Array.isArray(reviews) ? reviews : [];


//     useEffect(() => {
//         if (id) {
//             loadShopDetails();
//         }
//     }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

//     const loadShopDetails = async () => {
//         try {
//             setIsLoading(true);
//             console.log('🏪 Starting to load shop details for ID:', id);
//             console.log('🏪 Current user:', user ? `${user.role} (${user.id})` : 'Not authenticated');

//             // Load shop details - Try both endpoints and allow access based on user role
//             try {
//                 let shopResponse;
//                 let shopData;
//                 let loadedSuccessfully = false;

//                 // Try authenticated endpoint first if user is logged in
//                 if (user) {
//                     try {
//                         console.log('🏪 Trying authenticated shop endpoint for shop:', id);
//                         shopResponse = await shopService.getShop(id);
//                         shopData = shopResponse.data || shopResponse;
//                         console.log('🏪 Authenticated shop loaded:', shopData.name);
//                         loadedSuccessfully = true;
//                     } catch (authError) {
//                         console.log('🏪 Authenticated endpoint failed:', authError.message);
//                     }
//                 }

//                 // If authenticated failed or user not logged in, try public endpoint
//                 if (!loadedSuccessfully) {
//                     try {
//                         console.log('🏪 Trying public shop endpoint for shop:', id);
//                         shopResponse = await shopService.getShop(id);
//                         shopData = shopResponse.data || shopResponse;
//                         console.log('🏪 Public shop loaded successfully:', shopData.name);
//                         loadedSuccessfully = true;
//                     } catch (publicError) {
//                         console.log('🏪 Public endpoint also failed:', publicError.message);
//                     }
//                 }

//                 // If both endpoints failed, show error
//                 if (!loadedSuccessfully) {
//                     console.error('🏪 Both endpoints failed, shop not accessible');
//                     console.error('🏪 Shop ID:', id);
//                     console.error('🏪 User:', user ? `${user.role} - ${user.id}` : 'Not authenticated');
//                     setShop(null);
//                     return;
//                 }

//                 // Shop loaded successfully, now check access permissions
//                 console.log('🏪 Shop data loaded, checking permissions...');
//                 console.log('🏪 Shop approval status:', shopData.isApproved);
//                 console.log('🏪 User role:', user?.role);
//                 console.log('🏪 User ID:', user?.id);
//                 console.log('🏪 Shop owner:', shopData.owner);

//                 // Validate shop data
//                 if (!shopData || !shopData.name) {
//                     console.error('🏪 Invalid shop data received:', shopData);
//                     setShop(null);
//                     return;
//                 }

//                 // Always allow access if we successfully loaded the shop data
//                 // The backend will handle the access control
//                 console.log('🏪 Shop loaded successfully, proceeding to display...');

//                 console.log(`images: ${shopData['images']}`);

//                 // Default gold shop image
//                 const defaultShopImage = shopData['images'][0];

//                 // Load gallery from localStorage
//                 let localGallery = [];
//                 try {
//                     const galleryResponse = await shopService.getShopGallery(id);
//                     if (galleryResponse.success && galleryResponse.data.length > 0) {
//                         localGallery = galleryResponse.data;
//                         console.log(`📁 Loaded ${localGallery.length} images from localStorage for shop ${id}`);
//                     }
//                 } catch (galleryError) {
//                     console.log('📁 No local gallery found or error loading:', galleryError.message);
//                 }

//                 // Ensure shop has all required fields
//                 const processedShopData = {
//                     ...shopData,
//                     rating: shopData.averageRating || shopData.rating || 0,
//                     specialties: Array.isArray(shopData.specialties) ? shopData.specialties : [],
//                     gallery: localGallery.length > 0 ? localGallery : (Array.isArray(shopData.gallery) ? shopData.gallery : []),
//                     image: shopData.logoUrl || shopData.image || shopData.imageUrl || defaultShopImage
//                 };

//                 console.log('🏪 Processed shop data with gallery:', processedShopData);
//                 console.log(`📁 Final gallery has ${processedShopData.gallery.length} images`);
//                 setShop(processedShopData);
//             } catch (shopError) {
//                 console.error('🏪 Error loading shop details:', shopError);
//                 console.error('🏪 Error details:', {
//                     message: shopError.message,
//                     status: shopError.response?.status,
//                     data: shopError.response?.data,
//                     shopId: id
//                 });
//                 setShop(null);
//             }

//             // Load shop products
//             const loadProducts = async () => {
//                 try {
//                     const productsResponse = await productService.getProductsByShop(id);
//                     const productsData = Array.isArray(productsResponse)
//                         ? productsResponse
//                         : productsResponse.data || productsResponse.products || [];

//                     // Debug: Log the first product to understand the data structure
//                     if (productsData.length > 0) {
//                         console.log('📦 Sample product data:', productsData[0]);
//                         console.log('📦 Product keys:', Object.keys(productsData[0]));
//                     }

//                     setProducts(productsData);
//                 } catch (error) {
//                     console.error('Error loading products:', error);
//                     setProducts([]);
//                 }
//             };

//             // Load shop reviews
//             const loadReviews = async () => {
//                 try {
//                     const reviewsResponse = await rateService.getAllRates({ shopId: id });
//                     const reviewsData = Array.isArray(reviewsResponse)
//                         ? reviewsResponse
//                         : reviewsResponse.data || reviewsResponse.reviews || [];
//                     setReviews(reviewsData);
//                 } catch (error) {
//                     console.error('Error loading reviews:', error);
//                     setReviews([]);
//                 }
//             };

//             // Load products and reviews in parallel
//             await Promise.all([loadProducts(), loadReviews()]);

//         } catch (error) {
//             console.error('Error loading shop details:', error);
//             // Show error message instead of mock data
//             setShop(null);
//             setProducts([]);
//             setReviews([]);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleBookAppointment = () => {
//         if (!user) {
//             alert('Please login first to book an appointment');
//             navigate(ROUTES.LOGIN);
//             return;
//         }
//         navigate(ROUTES.BOOK_APPOINTMENT(id));
//     };

//     const handleAddToFavorites = async (productId) => {
//         if (!user) {
//             alert('Please login first to add product to favorites');
//             navigate(ROUTES.LOGIN);
//             return;
//         }

//         if (!productId) {
//             alert('Error: Product ID not found');
//             return;
//         }

//         try {
//             await productService.addToFavorites(productId);

//             // Update local state
//             setProducts(prev => prev.map(product => {
//                 const currentProductId = product.id || product._id;
//                 return currentProductId === productId
//                     ? { ...product, isFavorited: true }
//                     : product;
//             }));

//             alert('Product added to favorites successfully!');
//         } catch (error) {
//             console.error('Error adding to favorites:', error);
//             alert('Error adding product to favorites');
//         }
//     };

//     const handleDeleteGalleryImage = async (imageName, index) => {
//         if (!confirm('هل تريد حذف هذه الصورة من المعرض؟')) return;

//         try {
//             console.log('🗑️ Deleting gallery image:', imageName);
//             await shopService.deleteGalleryImage(shop._id || shop.id, imageName);

//             // Update local state
//             setShop(prev => ({
//                 ...prev,
//                 gallery: prev.gallery.filter((_, i) => i !== index)
//             }));

//             alert('تم حذف الصورة بنجاح!');
//         } catch (error) {
//             console.error('Error deleting gallery image:', error);
//             alert(error.message || 'حدث خطأ في حذف الصورة');
//         }
//     };


//     const ProductCard = ({ product }) => {
//         const productId = product.id || product._id;

//         // Array of default gold jewelry images
//         const defaultGoldImages = [
//             'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop&crop=center&auto=format&q=60', // Gold rings
//             'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=300&fit=crop&crop=center&auto=format&q=60', // Gold necklace
//             'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=300&fit=crop&crop=center&auto=format&q=60', // Gold earrings
//             'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=300&fit=crop&crop=center&auto=format&q=60', // Gold bracelet
//             'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=300&fit=crop&crop=center&auto=format&q=60'  // Gold jewelry set
//         ];

//         // Select a random default image based on product ID for consistency
//         const defaultProductImage = defaultGoldImages[productId ? (productId.length % defaultGoldImages.length) : 0];

//         return (
//             <Card
//                 className="group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer overflow-hidden border-0 bg-white rounded-3xl shadow-lg h-[500px] flex flex-col"
//                 onClick={() => {
//                     if (productId) {
//                         navigate(ROUTES.PRODUCT_DETAILS(productId));
//                     }
//                 }}
//             >
//                 <div className="relative overflow-hidden h-64">
//                     <img
//                         src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${product.logoUrl}`}
//                         alt={product.name || 'Product'}
//                         className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
//                         style={{
//                             filter: 'brightness(1.05) contrast(1.1) saturate(1.15)',
//                             imageRendering: 'crisp-edges'
//                         }}
//                         onError={(e) => {
//                             e.target.src = defaultProductImage;
//                         }}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

//                     {/* Favorite Button */}
//                     <Button
//                         size="sm"
//                         variant="ghost"
//                         className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full w-9 h-9 p-0 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             handleAddToFavorites(productId);
//                         }}
//                     >
//                         <Heart className={`w-4 h-4 ${product.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
//                     </Button>

//                     {/* Status Badge */}
//                     <Badge
//                         className="absolute top-3 left-3 bg-[#6D552C] hover:bg-[#8A6C37] text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
//                     >
//                         Available
//                     </Badge>
//                 </div>

//                 <CardContent className="p-5 flex-1 flex flex-col">
//                     <div className="space-y-3 flex-1">
//                         <div className="space-y-2">
//                             <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#A37F41] transition-colors duration-300 line-clamp-2 leading-tight min-h-[56px]">
//                                 {product.name || product.title || 'Untitled Product'}
//                             </h3>

//                             {product.description && (
//                                 <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 min-h-[40px]">
//                                     {product.description}
//                                 </p>
//                             )}
//                         </div>

//                         <div className="flex items-center justify-center py-2">
//                             <div className="flex items-center gap-2 bg-[#F8F4ED] px-4 py-2 rounded-full border border-[#E2D2B6]/50">
//                                 <div className="flex">
//                                     {[...Array(5)].map((_, i) => (
//                                         <Star
//                                             key={i}
//                                             className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
//                                                 ? 'fill-[#A37F41] text-[#A37F41]'
//                                                 : 'text-gray-300'
//                                                 }`}
//                                         />
//                                     ))}
//                                 </div>
//                                 <span className="text-sm font-semibold text-gray-800">
//                                     {typeof product.rating === 'number' ? product.rating.toFixed(1) : '0.0'}
//                                 </span>
//                                 <span className="text-xs text-gray-500">
//                                     ({product.reviewCount || product.reviews?.length || 0})
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="mt-auto pt-3 border-t border-gray-100">
//                         <Button
//                             size="sm"
//                             className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-full py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 if (productId) {
//                                     navigate(ROUTES.PRODUCT_DETAILS(productId));
//                                 }
//                             }}
//                         >
//                             <Eye className="w-4 h-4 mr-2" />
//                             View Details
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>
//         );
//     };

//     if (isLoading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB] flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A37F41] mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading shop details...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!shop) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB] flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="text-6xl mb-4">🏪</div>
//                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Available</h2>
//                     <p className="text-gray-600 mb-4">Sorry, this shop is currently unavailable or pending approval</p>
//                     <Button onClick={() => navigate(ROUTES.SHOPS)}>
//                         Back to Shops
//                     </Button>
//                 </div>
//             </div>
//         );
//     }

//     // Default gold shop image
//     const defaultShopImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop&crop=center&auto=format&q=60';

//     // Extract location data from GeoJSON format
//     let latitude = null;
//     let longitude = null;
//     if (shop.location && shop.location.coordinates) {
//         longitude = shop.location.coordinates[0];
//         latitude = shop.location.coordinates[1];
//     }

//     // Ensure shop has required properties to prevent errors
//     const safeShop = {
//         name: shop.name || 'Unnamed Shop',
//         description: shop.description || 'No description available',
//         address: shop.address || 'Address not specified',
//         phone: shop.phone || 'Not specified',
//         whatsapp: shop.whatsapp || null,
//         rating: shop.rating || 0,
//         workingHours: shop.workingHours || 'Not specified',
//         gallery: Array.isArray(shop.gallery) ? shop.gallery : [],
//         image: shop.image || defaultShopImage,
//         latitude: latitude,
//         longitude: longitude,
//         ...shop
//     };



//     return (
//         <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB] pt-20">
//             <div className="w-full px-0 py-6">
//                 {/* Enhanced Breadcrumb */}
//                 <div className="flex items-center gap-2 text-sm text-gray-600 mb-8 px-4 sm:px-6 lg:px-8">
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => navigate(-1)}
//                         className="flex items-center gap-2 hover:bg-white hover:shadow-sm transition-all duration-200 rounded-full px-4 py-2"
//                     >
//                         <ArrowLeft className="w-4 h-4" />
//                         {t('buttons.back', 'Back')}
//                     </Button>
//                     <Separator orientation="vertical" className="h-4" />
//                     <span onClick={() => navigate(ROUTES.SHOPS)} className="cursor-pointer hover:text-[#A37F41] transition-colors">
//                         {t('stores', 'Shops')}
//                     </span>
//                     <span className="text-gray-400">/</span>
//                     <span className="text-gray-900 font-medium">{safeShop.name}</span>
//                 </div>

//                 {/* Enhanced Shop Header */}
//                 <div className="bg-white shadow-xl mb-8 overflow-hidden">
//                     {/* Enhanced Hero Section */}
//                     <div className="relative h-80 md:h-[500px] overflow-hidden">
//                         <img
//                             src={`${import.meta.env.VITE_API_BASE_URL}/shop-image/${safeShop.logoUrl}`}
//                             alt={safeShop.name}
//                             className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
//                             style={{
//                                 filter: 'brightness(1.1) contrast(1.1) saturate(1.2)',
//                                 imageRendering: 'crisp-edges'
//                             }}
//                             onError={(e) => {
//                                 e.target.src = defaultShopImage;
//                             }}
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

//                         {/* Decorative overlay pattern */}
//                         <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-yellow-600/5"></div>

//                         {/* Action Buttons */}
//                         <div className="absolute top-6 right-6 flex gap-2">
//                             <Button
//                                 size="sm"
//                                 variant="secondary"
//                                 className="bg-white/90 hover:bg-white backdrop-blur-sm"
//                             >
//                                 <Share2 className="w-4 h-4" />
//                             </Button>
//                             <Button
//                                 size="sm"
//                                 variant="secondary"
//                                 className="bg-white/90 hover:bg-white backdrop-blur-sm"
//                             >
//                                 <Heart className="w-4 h-4" />
//                             </Button>
//                         </div>

//                         {/* Shop Info Overlay */}
//                         <div className="absolute bottom-0 left-0 right-0 p-8">
//                             <div className="flex items-end justify-between">
//                                 <div className="text-white">
//                                     <div className="flex items-center gap-3 mb-3">
//                                         <h1 className="text-4xl md:text-5xl font-bold">{safeShop.name}</h1>
//                                         {safeShop.verified && (
//                                             <Badge className="bg-[#6D552C] hover:bg-[#8A6C37] flex items-center gap-1">
//                                                 <Verified className="w-3 h-3" />
//                                                 متجر موثق
//                                             </Badge>
//                                         )}
//                                     </div>
//                                     <div className="flex items-center gap-6 text-white/90">
//                                         <div className="flex items-center gap-2">
//                                             <div className="flex">
//                                                 {[...Array(5)].map((_, i) => (
//                                                     <Star
//                                                         key={i}
//                                                         className={`w-5 h-5 ${i < Math.floor(safeShop.rating)
//                                                             ? 'fill-[#C5A56D] text-[#C5A56D]'
//                                                             : 'text-white/40'
//                                                             }`}
//                                                     />
//                                                 ))}
//                                             </div>
//                                             <span className="text-lg font-semibold">
//                                                 {safeShop.rating ? safeShop.rating.toFixed(1) : '0.0'}
//                                             </span>
//                                             <span className="text-sm">
//                                                 ({safeReviews.length} تقييم)
//                                             </span>
//                                         </div>
//                                         <div className="flex items-center gap-1">
//                                             <Award className="w-4 h-4" />
//                                             <span className="text-sm">
//                                                 منذ {safeShop.established || safeShop.createdAt ?
//                                                     new Date(safeShop.established || safeShop.createdAt).getFullYear() :
//                                                     'غير محدد'
//                                                 }
//                                             </span>

//                                         </div>


//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Enhanced Shop Info Section */}
//                     <div className="p-8">
//                         {/* Contact Information Cards */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//                             <Card className="border-0 bg-gradient-to-r from-[#F0E8DB] to-[#E2D2B6] hover:shadow-lg transition-shadow rounded-2xl">
//                                 <CardContent className="p-6 flex items-center gap-4">
//                                     <div className="p-3 bg-[#C37C00] rounded-full">
//                                         <MapPin className="w-6 h-6 text-white" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-[#C37C00] font-medium mb-1">{t('shop_details.address')}</p>
//                                         <p className="text-gray-800 font-semibold text-base">{safeShop.address}</p>
//                                     </div>
//                                 </CardContent>
//                             </Card>

//                             <Card className="border-0 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:shadow-lg transition-shadow rounded-2xl">
//                                 <CardContent className="p-6 flex items-center gap-4">
//                                     <div className="p-3 bg-indigo-500 rounded-full">
//                                         <FaPhone className="w-6 h-6 text-white" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-indigo-600 font-medium mb-1">{t('shop_details.phone')}</p>
//                                         <p className="text-gray-800 font-semibold text-base">
//                                             <a
//                                                 href={`tel:${safeShop.phone}`}
//                                                 className="hover:text-indigo-600 transition-colors"
//                                             >
//                                                 {safeShop.phone}
//                                             </a>
//                                         </p>
//                                     </div>
//                                 </CardContent>
//                             </Card>



//                             <Card className="border-0 bg-gradient-to-r from-[#F8F4ED] to-[#F0E8DB] hover:shadow-lg transition-shadow rounded-2xl">
//                                 <CardContent className="p-6 flex items-center gap-4">
//                                     <div className="p-3 bg-[#C37C00] rounded-full">
//                                         <FaWhatsapp className="w-6 h-6 text-white" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-[#8A6C37] font-medium mb-1">WhatsApp</p>
//                                         <p className="text-gray-800 font-semibold text-base">
//                                             <a
//                                                 href={`https://wa.me/${safeShop.phone}`}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="hover:text-[#A37F41] transition-colors"
//                                             >
//                                                 {safeShop.phone}
//                                             </a>
//                                         </p>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                             {/* {safeShop.whatsapp && (
//                                 <Card className="border-0 bg-gradient-to-r from-[#F8F4ED] to-[#F0E8DB] hover:shadow-lg transition-shadow rounded-2xl">
//                                     <CardContent className="p-6 flex items-center gap-4">
//                                         <div className="p-3 bg-[#A37F41] rounded-full">
//                                             <WhatsAppIcon className="w-6 h-6 text-white" />
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-[#8A6C37] font-medcdium mb-1">{t('shop_details.whatsapp')}</p>
//                                             <p className="text-gray-800 font-semibold text-base">
//                                                 <a
//                                                     href={`https://wa.me/${safeShop.whatsapp.replace(/[^0-9]/g, '')}`}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="hover:text-[#A37F41] transition-colors"
//                                                 >
//                                                     {safeShop.whatsapp}
//                                                 </a>
//                                             </p>
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             )} */}



//                             <Card className="border-0 bg-gradient-to-r from-purple-50 to-purple-100 hover:shadow-lg transition-shadow rounded-2xl">
//                                 <CardContent className="p-6 flex items-center gap-4">
//                                     <div className="p-3 bg-purple-500 rounded-full">
//                                         <Clock className="w-6 h-6 text-white" />
//                                     </div>
//                                     <div>
//                                         <p className="text-sm text-purple-600 font-medium mb-1">{t('shop_details.working_hours')}</p>
//                                         <p className="text-gray-800 font-semibold text-base">{safeShop.workingHours}</p>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         </div>

//                         {/* Description */}
//                         <div className="mb-10">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h3 className="text-2xl font-bold text-gray-900">
//                                     {t('shop_details.about_shop')}
//                                 </h3>
//                                 <Button
//                                     size="lg"
//                                     onClick={handleBookAppointment}
//                                     className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
//                                 >
//                                     <Calendar className="w-6 h-6 mr-3" />
//                                     {t('shop_details.book_appointment')}
//                                 </Button>
//                             </div>

//                             <p className="text-gray-700 leading-relaxed text-xl bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB] p-6 rounded-2xl border border-[#E2D2B6]/30">
//                                 {safeShop.description}
//                             </p>

//                             {user?.role === 'user' && (
//                                 <div className="mt-6">
//                                     <Button
//                                         size="lg"
//                                         variant="outline"
//                                         onClick={() => navigate(`/shops/${safeShop._id || safeShop.id}/chat`)}
//                                         className="border-2 border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] hover:border-[#A66A00] hover:text-[#A66A00] px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
//                                     >
//                                         <Bot className="w-6 h-6 mr-3" />
//                                         {t('shop_details.chat_with_store')}
//                                     </Button>
//                                 </div>
//                             )}
//                         </div>


//                         {/* Action Section */}
//                         <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl">
//                             {/* <div className="flex gap-6">
//                                 <Button
//                                     size="lg"
//                                     onClick={handleBookAppointment}
//                                     className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
//                                 >
//                                     <Calendar className="w-6 h-6 mr-3" />
//                                     {t('shop_details.book_appointment')}
//                                 </Button>
//                                 {user?.role === 'user' && (
//                                     <Button
//                                         size="lg"
//                                         variant="outline"
//                                         onClick={() => navigate(`/shops/${safeShop._id || safeShop.id}/chat`)}
//                                         className="border-2 border-[#C37C00] text-[#C37C00] hover:bg-[#FFF8E6] hover:border-[#A66A00] hover:text-[#A66A00] px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
//                                     >
//                                         <Bot className="w-6 h-6 mr-3" />
//                                         {t('shop_details.chat_with_store')}
//                                     </Button>
//                                 )}
//                             </div> */}
//                         </div>
//                     </div>
//                 </div>

//                 {/* Enhanced Shop Content Tabs */}
//                 <div className="bg-white shadow-xl overflow-hidden">
//                     <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//                         <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-[#F8F4ED] to-[#F0E8DB] p-3 rounded-none h-auto border-b border-[#E2D2B6]/30">
//                             <TabsTrigger
//                                 value="products"
//                                 className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
//                             >
//                                 <ShoppingBag className="w-6 h-6 mr-3" />
//                                 {t('shop_details.products')} ({safeProducts.length})
//                             </TabsTrigger>
//                             <TabsTrigger
//                                 value="reviews"
//                                 className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
//                             >
//                                 <Star className="w-6 h-6 mr-3" />
//                                 {t('shop_details.reviews')} ({safeReviews.length})
//                             </TabsTrigger>
//                             <TabsTrigger
//                                 value="location"
//                                 className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
//                             >
//                                 <MapPin className="w-6 h-6 mr-3" />
//                                 {t('shop_details.location')}
//                             </TabsTrigger>
//                             <TabsTrigger
//                                 value="gallery"
//                                 className="data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-2xl py-5 px-8 font-bold text-lg transition-all"
//                             >
//                                 <Eye className="w-6 h-6 mr-3" />
//                                 {t('shop_details.gallery')} {safeShop.gallery?.length ? `(${safeShop.gallery.length})` : ''}
//                             </TabsTrigger>
//                         </TabsList>

//                         <TabsContent value="products" className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
//                             <div className="flex items-center justify-between mb-10">
//                                 <div>
//                                     <h2 className="text-4xl font-bold text-gray-900 mb-3">Shop Products</h2>
//                                     <p className="text-gray-600 text-lg">Discover our exclusive collection</p>
//                                 </div>
//                                 <div className="flex items-center gap-4">
//                                     <div className="flex bg-[#F0E8DB] rounded-full p-2 border border-[#E2D2B6]/50">
//                                         <Button
//                                             variant={viewMode === 'grid' ? 'default' : 'ghost'}
//                                             size="lg"
//                                             onClick={() => setViewMode('grid')}
//                                             className={`rounded-full px-6 py-3 font-semibold ${viewMode === 'grid' ? 'bg-white shadow-lg text-[#8A6C37]' : 'hover:bg-[#E2D2B6] text-gray-600'}`}
//                                         >
//                                             <Grid className="w-5 h-5 mr-2" />
//                                             Grid
//                                         </Button>
//                                         <Button
//                                             variant={viewMode === 'list' ? 'default' : 'ghost'}
//                                             size="lg"
//                                             onClick={() => setViewMode('list')}
//                                             className={`rounded-full px-6 py-3 font-semibold ${viewMode === 'list' ? 'bg-white shadow-lg text-[#8A6C37]' : 'hover:bg-[#E2D2B6] text-gray-600'}`}
//                                         >
//                                             <List className="w-5 h-5 mr-2" />
//                                             List
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </div>

//                             {safeProducts.length > 0 ? (
//                                 <div>
//                                     <div className="mb-6 text-base text-gray-600 font-medium">
//                                         Showing {safeProducts.length} products from {safeShop.name}
//                                     </div>
//                                     <div className={`grid gap-6 ${viewMode === 'grid'
//                                         ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
//                                         : 'grid-cols-1'
//                                         }`}>
//                                         {safeProducts.map((product) => {
//                                             const productKey = product.id || product._id || Math.random();
//                                             return (
//                                                 <ProductCard key={productKey} product={product} />
//                                             );
//                                         })}
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12 bg-gradient-to-br from-[#F8F4ED] to-[#F0E8DB] rounded-lg border border-[#E2D2B6]/30">
//                                     <div className="text-6xl mb-4">📦</div>
//                                     <h3 className="text-xl font-medium text-gray-900 mb-2">
//                                         لا توجد منتجات في هذا المتجر
//                                     </h3>
//                                     <p className="text-gray-600 mb-4">
//                                         لم يتم إضافة منتجات لمتجر "{safeShop.name}" بعد
//                                     </p>
//                                     {user?.role === 'admin' || user?.id === safeShop.ownerId ? (
//                                         <Button
//                                             variant="outline"
//                                             onClick={() => navigate(ROUTES.PRODUCTS_CREATE)}
//                                         >
//                                             إضافة منتج جديد
//                                         </Button>
//                                     ) : (
//                                         <p className="text-sm text-gray-500">
//                                             تواصل مع صاحب المتجر لإضافة منتجات
//                                         </p>
//                                     )}
//                                 </div>
//                             )}
//                         </TabsContent>

//                         <TabsContent value="reviews" className="px-4 sm:px-6 lg:px-8 py-8">
//                             <div className="mb-8">
//                                 <h2 className="text-3xl font-bold text-gray-900 mb-2">تقييمات العملاء</h2>
//                                 <p className="text-gray-600">اقرأ آراء عملائنا وتجاربهم معنا</p>
//                             </div>

//                             {safeReviews.length > 0 ? (
//                                 <div className="space-y-6">
//                                     {safeReviews.map((review) => (
//                                         <Card key={review.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
//                                             <CardContent className="p-8">
//                                                 <div className="flex items-start gap-4">
//                                                     <Avatar className="w-12 h-12 border-2 border-gray-200">
//                                                         <AvatarImage src={review.userAvatar} />
//                                                         <AvatarFallback className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white font-bold">
//                                                             {review.userName?.charAt(0) || 'ع'}
//                                                         </AvatarFallback>
//                                                     </Avatar>

//                                                     <div className="flex-1">
//                                                         <div className="flex items-center justify-between mb-3">
//                                                             <div className="flex items-center gap-3">
//                                                                 <span className="font-bold text-lg text-gray-900">{review.userName}</span>
//                                                                 {review.verified && (
//                                                                     <Badge className="bg-[#F0E8DB] text-[#6D552C] border-[#E2D2B6]">
//                                                                         <Verified className="w-3 h-3 mr-1" />
//                                                                         عميل موثق
//                                                                     </Badge>
//                                                                 )}
//                                                             </div>
//                                                             <span className="text-sm text-gray-500 bg-[#F0E8DB] px-3 py-1 rounded-full border border-[#E2D2B6]/50">
//                                                                 {review.date}
//                                                             </span>
//                                                         </div>

//                                                         <div className="flex items-center mb-4">
//                                                             <div className="flex mr-2">
//                                                                 {[...Array(5)].map((_, i) => (
//                                                                     <Star
//                                                                         key={i}
//                                                                         className={`w-5 h-5 ${i < review.rating
//                                                                             ? 'fill-[#A37F41] text-[#A37F41]'
//                                                                             : 'text-gray-300'
//                                                                             }`}
//                                                                     />
//                                                                 ))}
//                                                             </div>
//                                                             <span className="text-sm font-medium text-gray-700">
//                                                                 {review.rating}/5
//                                                             </span>
//                                                         </div>

//                                                         <p className="text-gray-700 leading-relaxed text-lg">
//                                                             "{review.comment}"
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             </CardContent>
//                                         </Card>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
//                                     <div className="text-8xl mb-6">⭐</div>
//                                     <h3 className="text-2xl font-bold text-gray-900 mb-3">
//                                         لا توجد تقييمات بعد
//                                     </h3>
//                                     <p className="text-gray-600 text-lg mb-6">
//                                         كن أول من يقيم هذا المتجر ويشارك تجربته
//                                     </p>
//                                     <Button
//                                         className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-8 py-3 rounded-full font-semibold"
//                                     >
//                                         اكتب تقييماً
//                                     </Button>
//                                 </div>
//                             )}
//                         </TabsContent>

//                         <TabsContent value="location" className="px-4 sm:px-6 lg:px-8 py-8">
//                             <div className="mb-8">
//                                 <h2 className="text-3xl font-bold text-gray-900 mb-2">موقع المتجر</h2>
//                                 <p className="text-gray-600">اعثر على المتجر واحصل على الاتجاهات</p>
//                             </div>

//                             <MapDisplay
//                                 latitude={safeShop.latitude}
//                                 longitude={safeShop.longitude}
//                                 shopName={safeShop.name}
//                                 shopAddress={safeShop.address}
//                                 height="400px"
//                                 showDirections={true}
//                                 showHeader={false}
//                             />
//                         </TabsContent>

//                         <TabsContent value="gallery" className="px-4 sm:px-6 lg:px-8 py-8">
//                             <div className="flex items-center justify-between mb-12">
//                                 <div>
//                                     <h2 className="text-4xl font-bold text-gray-900 mb-3">معرض صور المتجر</h2>
//                                     <p className="text-gray-600 text-lg">استكشف صور المتجر والأعمال المميزة بجودة عالية</p>
//                                 </div>
//                                 {(user?.role === 'admin' || user?.id === safeShop.ownerId || user?._id === safeShop.ownerId) && (
//                                     <GalleryUpload
//                                         shopId={safeShop._id || safeShop.id}
//                                         currentUser={user}
//                                         onUploadSuccess={(newImages) => {
//                                             console.log('🖼️ Gallery upload success, updating shop state with:', newImages);
//                                             setShop(prev => ({
//                                                 ...prev,
//                                                 gallery: [...(prev.gallery || []), ...newImages]
//                                             }));
//                                             // Reload shop data to get updated gallery
//                                             loadShopDetails();
//                                         }}
//                                     />
//                                 )}
//                             </div>

//                             {safeShop.gallery && safeShop.gallery.length > 0 ? (
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//                                     {safeShop.gallery.map((image, index) => {
//                                         // Handle both localStorage images (objects) and regular images (strings)
//                                         const isLocalImage = typeof image === 'object' && image.data;
//                                         const imageUrl = isLocalImage ? image.data : `${import.meta.env.VITE_API_BASE_URL}/shop-gallery/${image}`;
//                                         const imageName = isLocalImage ? image.name : `صورة ${index + 1}`;
//                                         const imageId = isLocalImage ? image.id : image;

//                                         return (
//                                             <div key={imageId} className="group relative">
//                                                 {/* Enhanced image container */}
//                                                 <div className="relative aspect-square rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
//                                                     <img
//                                                         src={imageUrl}
//                                                         alt={`${safeShop.name} - ${imageName}`}
//                                                         className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 cursor-pointer"
//                                                         style={{
//                                                             filter: 'brightness(1.05) contrast(1.1) saturate(1.15)',
//                                                             imageRendering: 'crisp-edges'
//                                                         }}
//                                                         onError={(e) => {
//                                                             e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center&auto=format&q=60';
//                                                         }}
//                                                         onClick={() => {
//                                                             // فتح الصورة في نافذة جديدة
//                                                             window.open(imageUrl, '_blank');
//                                                         }}
//                                                     />

//                                                     {/* Enhanced overlay with gradient */}
//                                                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
//                                                         {/* Image info */}
//                                                         <div className="absolute bottom-4 left-4 right-4 text-white">
//                                                             <p className="font-bold text-lg mb-1">{imageName}</p>
//                                                             <p className="text-sm text-white/80">اضغط للعرض بالحجم الكامل</p>
//                                                             {isLocalImage && (
//                                                                 <p className="text-xs text-[#C5A56D] mt-1">محفوظة محلياً</p>
//                                                             )}
//                                                         </div>

//                                                         {/* View icon */}
//                                                         <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-full p-2">
//                                                             <Eye className="w-5 h-5 text-white" />
//                                                         </div>
//                                                     </div>
//                                                     {(user?.role === 'admin' || user?.id === safeShop.ownerId || user?._id === safeShop.ownerId) && (
//                                                         <button
//                                                             className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                                                             onClick={(e) => {
//                                                                 e.stopPropagation();
//                                                                 handleDeleteGalleryImage(imageId, index);
//                                                             }}
//                                                         >
//                                                             <X className="w-4 h-4" />
//                                                         </button>
//                                                     )}
//                                                 </div>

//                                                 {/* Image title below */}
//                                                 <div className="mt-4 text-center">
//                                                     <h3 className="font-semibold text-gray-900 text-lg">{imageName}</h3>
//                                                     <p className="text-gray-500 text-sm mt-1">معرض {safeShop.name}</p>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
//                                     <div className="text-8xl mb-6">📸</div>
//                                     <h3 className="text-2xl font-bold text-gray-900 mb-3">
//                                         لا توجد صور في المعرض
//                                     </h3>
//                                     <p className="text-gray-600 text-lg mb-6">
//                                         لم يتم إضافة صور لمعرض المتجر بعد
//                                     </p>
//                                     {(user?.role === 'admin' || user?.id === safeShop.ownerId || user?._id === safeShop.ownerId) && (
//                                         <GalleryUpload
//                                             shopId={safeShop._id || safeShop.id}
//                                             currentUser={user}
//                                             onUploadSuccess={(newImages) => {
//                                                 console.log('🖼️ Gallery upload success (empty state), updating shop state with:', newImages);
//                                                 setShop(prev => ({
//                                                     ...prev,
//                                                     gallery: [...(prev.gallery || []), ...newImages]
//                                                 }));
//                                                 // Reload shop data to get updated gallery
//                                                 loadShopDetails();
//                                             }}
//                                         />
//                                     )}
//                                 </div>
//                             )}
//                         </TabsContent>
//                     </Tabs>
//                 </div>
//                 {/* Chat Modal */}
//                 {/* Remove the ShopChat modal rendering. */}
//             </div>

//         </div>


//     );
// };

// export default ShopDetails;

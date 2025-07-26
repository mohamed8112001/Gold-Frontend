import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import {
    Save,
    ArrowLeft,
    Upload,
    X
} from 'lucide-react';
import { productService } from '../../services/productService.js';
import { shopService } from '../../services/shopService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import { useTranslation } from 'react-i18next';

const EditProduct = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { id } = useParams();
    const { user, isShopOwner } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Updating...');
    const [userShop, setUserShop] = useState(null);
    const [product, setProduct] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        karat: '',
        weight: '',
        design_type: '',
        category: ''
    });
    const [logo, setLogo] = useState(null);
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);

    useEffect(() => {
        if (!user || !isShopOwner) {
            navigate(ROUTES.LOGIN);
            return;
        }

        // Check if user has paid
        if (!user.paid) {
            alert('يجب إتمام عملية الدفع أولاً لتعديل المنتجات');
            navigate('/owner-payment');
            return;
        }

        // Validate product ID
        if (!id) {
            console.error('❌ Product ID is missing from URL');
            alert('Product ID is missing. Please check the URL.');
            navigate(ROUTES.MANAGE_SHOP);
            return;
        }

        if (id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            console.error('❌ Invalid product ID format:', id);
            alert('Invalid product ID format. Please check the URL.');
            navigate(ROUTES.MANAGE_SHOP);
            return;
        }

        console.log('✅ Valid product ID:', id);
        loadUserShop();
        loadProduct();
    }, [user, isShopOwner, navigate, id]);

    const loadUserShop = async () => {
        try {
            console.log('🏪 Loading user shop for product editing...');
            const response = await shopService.getAllShops();
            const shopsData = Array.isArray(response) ? response : response.data || [];
            const userShopData = shopsData.find(shop =>
                shop.owner === user.id ||
                shop.owner?._id === user.id ||
                shop.ownerId === user.id ||
                shop.userId === user.id
            );

            if (userShopData) {
                console.log('✅ User shop found:', userShopData);

                // Check shop approval status
                if (userShopData.requestStatus !== 'approved') {
                    let message = 'لا يمكن تعديل المنتجات حتى يتم اعتماد المتجر من قبل الإدارة.';

                    if (userShopData.requestStatus === 'pending') {
                        message += '\n\nحالة المتجر: في انتظار المراجعة';
                    } else if (userShopData.requestStatus === 'rejected') {
                        message += '\n\nحالة المتجر: مرفوض';
                        if (userShopData.rejectionReason) {
                            message += `\nالسبب: ${userShopData.rejectionReason}`;
                        }
                    }

                    alert(message);
                    navigate('/dashboard');
                    return;
                }

                setUserShop(userShopData);
            } else {
                console.log('❌ No shop found for user');
                alert('يجب إنشاء متجر أولاً قبل تعديل المنتجات');
                navigate(ROUTES.CREATE_SHOP);
            }
        } catch (error) {
            console.error('❌ Error loading user shop:', error);
            alert('Error loading shop information');
        }
    };

    const loadProduct = async () => {
        try {
            console.log('📦 Loading product for editing:', id);
            const response = await productService.getProduct(id);
            const productData = response.data || response;

            console.log('✅ Product loaded:', productData);
            console.log('📊 Product weight data:', productData.weight, typeof productData.weight);
            setProduct(productData);

            // Populate form with existing data
            // Safely extract price value
            let priceValue = '';
            if (productData.price) {
                if (typeof productData.price === 'object' && productData.price['$numberDecimal']) {
                    priceValue = productData.price['$numberDecimal'];
                } else if (typeof productData.price === 'string' || typeof productData.price === 'number') {
                    priceValue = String(productData.price);
                }
            }

            // Safely extract weight value
            let weightValue = '';
            if (productData.weight) {
                if (typeof productData.weight === 'object') {
                    if (productData.weight['$numberDecimal']) {
                        weightValue = productData.weight['$numberDecimal'];
                    } else if (productData.weight.value !== undefined) {
                        weightValue = String(productData.weight.value);
                    } else {
                        // If it's an object but not in expected format, try to extract any numeric value
                        const weightKeys = Object.keys(productData.weight);
                        if (weightKeys.length > 0) {
                            weightValue = String(productData.weight[weightKeys[0]]);
                        }
                    }
                } else if (typeof productData.weight === 'string' || typeof productData.weight === 'number') {
                    weightValue = String(productData.weight);
                }
            }

            const formDataToSet = {
                title: productData.title || productData.name || '',
                description: productData.description || '',
                price: priceValue,
                karat: productData.karat ? String(productData.karat) : '',
                weight: weightValue,
                design_type: productData.design_type ? String(productData.design_type) : '',
                category: productData.category ? String(productData.category) : ''
            };

            console.log('📝 Setting form data:', formDataToSet);
            setFormData(formDataToSet);

            // Set existing images
            if (productData.images && productData.images.length > 0) {
                setExistingImages(productData.images);
            }

            // Set existing logo if available
            if (productData.logoUrl) {
                console.log('Current logo URL:', productData.logoUrl);
            }

            // Verify product belongs to user's shop
            if (userShop && productData.shop) {
                const productShopId = productData.shop._id || productData.shop;
                const userShopId = userShop._id || userShop.id;

                if (productShopId !== userShopId) {
                    console.warn('⚠️ Product belongs to different shop:', {
                        productShop: productShopId,
                        userShop: userShopId
                    });
                }
            }

        } catch (error) {
            console.error('❌ Error loading product:', error);
            alert(`Error loading product information: ${error.message || 'Unknown error'}\n\nPlease check if the product exists and you have permission to edit it.`);
            navigate(ROUTES.MANAGE_SHOP);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
        }
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate product ID first
        if (!id || id.trim() === '') {
            alert('Product ID is missing. Please try refreshing the page.');
            return;
        }

        // Validate ID format (MongoDB ObjectId is 24 characters)
        if (id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
            alert('Invalid product ID format. Please check the URL.');
            return;
        }

        if (!userShop) {
            alert('Shop information not loaded');
            return;
        }

        // Enhanced Validation
        if (!formData.title?.trim()) {
            alert('Product title is required');
            return;
        }

        if (!formData.description?.trim()) {
            alert('Product description is required');
            return;
        }

        if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            alert('Please enter a valid price greater than 0');
            return;
        }

        // Validate shop information
        if (!userShop || (!userShop._id && !userShop.id)) {
            alert('Shop information is missing. Please try refreshing the page.');
            return;
        }

        try {
            setIsLoading(true);
            setLoadingMessage('Updating product information...');

            // Check if we have files to upload
            const hasFiles = logo || images.length > 0;

            let productData;

            if (hasFiles) {
                // Use FormData for file uploads
                productData = new FormData();

                // Add form data with proper validation
                Object.keys(formData).forEach(key => {
                    const value = formData[key];
                    if (value !== null && value !== undefined && value !== '') {
                        // Special handling for numeric fields
                        if (key === 'price') {
                            const numericPrice = parseFloat(value);
                            if (!isNaN(numericPrice) && numericPrice > 0) {
                                productData.append(key, numericPrice.toString());
                            }
                        } else if (key === 'weight') {
                            // Handle weight as numeric value
                            const numericWeight = parseFloat(value);
                            if (!isNaN(numericWeight) && numericWeight > 0) {
                                productData.append(key, numericWeight.toString());
                            } else if (value.trim()) {
                                // If it's not a number but has content, send as string
                                productData.append(key, String(value).trim());
                            }
                        } else {
                            // Ensure we're sending clean string values for other fields
                            productData.append(key, String(value).trim());
                        }
                    }
                });

                // Add shop ID with validation
                const shopId = userShop._id || userShop.id;
                if (shopId) {
                    productData.append('shop', String(shopId));
                    console.log('🏪 Adding shop ID:', shopId);
                } else {
                    throw new Error('Shop ID is missing');
                }

                // Add logo if selected
                if (logo) {
                    productData.append('logo', logo);
                    console.log('📷 Adding new logo to update');
                }

                // Add new images
                if (images.length > 0) {
                    images.forEach((image) => {
                        productData.append('images', image);
                    });
                    console.log(`📷 Adding ${images.length} new images`);
                }

                // Add existing images that weren't removed
                if (existingImages.length > 0) {
                    productData.append('existingImages', JSON.stringify(existingImages));
                    console.log('📷 Preserving existing images:', existingImages.length);
                } else {
                    // Explicitly indicate no existing images
                    productData.append('existingImages', JSON.stringify([]));
                    console.log('📷 No existing images to preserve');
                }
            } else {
                // Use FormData even for text-only updates to maintain consistency
                productData = new FormData();

                // Add form data with proper validation
                Object.keys(formData).forEach(key => {
                    const value = formData[key];
                    if (value !== null && value !== undefined && value !== '') {
                        // Special handling for numeric fields
                        if (key === 'price') {
                            const numericPrice = parseFloat(value);
                            if (!isNaN(numericPrice) && numericPrice > 0) {
                                productData.append(key, numericPrice.toString());
                            }
                        } else if (key === 'weight') {
                            // Handle weight as numeric value
                            const numericWeight = parseFloat(value);
                            if (!isNaN(numericWeight) && numericWeight > 0) {
                                productData.append(key, numericWeight.toString());
                            } else if (value.trim()) {
                                // If it's not a number but has content, send as string
                                productData.append(key, String(value).trim());
                            }
                        } else {
                            // Ensure we're sending clean string values for other fields
                            productData.append(key, String(value).trim());
                        }
                    }
                });

                // Add shop ID with validation
                const shopId = userShop._id || userShop.id;
                if (shopId) {
                    productData.append('shop', String(shopId));
                    console.log('🏪 Adding shop ID:', shopId);
                } else {
                    throw new Error('Shop ID is missing');
                }

                // Add existing images if any
                if (existingImages.length > 0) {
                    productData.append('existingImages', JSON.stringify(existingImages));
                    console.log('📷 Preserving existing images:', existingImages.length);
                } else {
                    // Explicitly indicate no existing images
                    productData.append('existingImages', JSON.stringify([]));
                    console.log('📷 No existing images to preserve');
                }

                console.log('📦 Sending FormData (text only, no new files)');
            }

            // Final validation before sending
            if (!id || id.trim() === '') {
                throw new Error('Product ID is missing');
            }

            console.log('📦 Updating product with ID:', id);
            console.log('📦 Has files:', hasFiles);
            console.log('📦 User shop:', userShop);
            console.log('📦 Form data:', formData);

            // Log FormData contents if applicable
            if (hasFiles && productData instanceof FormData) {
                console.log('📦 FormData contents:');
                for (let [key, value] of productData.entries()) {
                    if (value instanceof File) {
                        console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
                    } else {
                        console.log(`  ${key}: ${value}`);
                    }
                }
            }

            console.log('🔄 About to update product with ID:', id);
            console.log('📦 Product data type:', productData.constructor.name);

            const response = await productService.updateProduct(id, productData);
            console.log('✅ Product updated successfully:', response);

            alert(`Product "${formData.title}" updated successfully! 🎉`);
            navigate(ROUTES.MANAGE_SHOP);

        } catch (error) {
            console.error('❌ Error updating product:', error);

            let errorMessage = 'Unknown error occurred';
            let technicalDetails = '';

            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const data = error.response.data;

                errorMessage = data?.message || data?.error || `Server error (${status})`;
                technicalDetails = `Status: ${status}, Data: ${JSON.stringify(data)}`;

                console.error('Server response:', {
                    status,
                    statusText: error.response.statusText,
                    data,
                    headers: error.response.headers
                });

                // Specific error handling
                if (status === 400) {
                    errorMessage = 'Invalid product data. Please check all fields and try again.';
                } else if (status === 401) {
                    errorMessage = 'Authentication failed. Please log in again.';
                } else if (status === 403) {
                    errorMessage = 'You do not have permission to edit this product.';
                } else if (status === 404) {
                    errorMessage = 'Product not found. It may have been deleted.';
                } else if (status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                }
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = 'Network error - please check your internet connection';
                technicalDetails = 'No response received from server';
                console.error('Network error:', error.request);
            } else {
                // Something else happened
                errorMessage = error.message || 'Unknown error';
                technicalDetails = error.stack || 'No additional details';
            }

            console.error('Technical details:', technicalDetails);
            console.error('Product ID used:', id);
            console.error('Product ID type:', typeof id);
            console.error('Product ID length:', id?.length);

            alert(`Error updating product: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] pt-20">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center mx-auto mb-6 ">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Product</h2>
                        <p className="text-gray-600">Please wait while we fetch the product details...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] pt-20">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Header */}
                <div className="bg-white rounded-2xl  border border-gray-100 p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button
                                variant="outline"
                                onClick={() => navigate(ROUTES.MANAGE_SHOP)}
                                className="flex items-center gap-2 border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-xl px-6 py-3 font-semibold transition-all duration-300"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Shop Management
                            </Button>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-1">
                                    Edit Product
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    Update product information, images, and details
                                </p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Last Updated</p>
                                <p className="font-semibold text-gray-800">
                                    {new Date().toLocaleDateString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-[#C37C00] to-[#A66A00] rounded-xl flex items-center justify-center">
                                <span className="text-white text-xl">✏️</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Current Product Preview */}
                {product && (
                    <div className="mb-8">
                        {/* Product Header */}
                        <div className="bg-gradient-to-r from-[#C37C00] via-[#D4860A] to-[#A66A00] rounded-t-3xl p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <span className="text-3xl">✨</span>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold mb-1">Current Product</h2>
                                        <p className="text-white/90 text-lg">{product.title}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
                                        <p className="text-sm text-white/80">Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <p className="font-bold text-lg">Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Content */}
                        <div className="bg-white rounded-b-3xl  overflow-hidden">
                            <div className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Main Product Image */}
                                    <div className="lg:col-span-1">
                                        <div className="relative group">
                                            {product.logoUrl ? (
                                                <div className="relative overflow-hidden rounded-2xl ">
                                                    <img
                                                        src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${product.logoUrl}`}
                                                        alt={product.title}
                                                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                                                        <span className="text-sm font-semibold text-gray-800">Main Image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex flex-col items-center justify-center ">
                                                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                                                        <span className="text-2xl text-gray-500">📷</span>
                                                    </div>
                                                    <p className="text-gray-500 font-medium">No image available</p>
                                                    <p className="text-gray-400 text-sm">Upload a new image below</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Basic Info */}
                                        <div className="bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] rounded-2xl p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-[#C37C00] rounded-full"></span>
                                                Product Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white rounded-xl p-4 ">
                                                    <p className="text-sm text-gray-500 mb-1">Price</p>
                                                    <p className="text-2xl font-bold text-[#C37C00]">
                                                        {typeof product.price === 'object' && product.price?.['$numberDecimal']
                                                            ? `${product.price['$numberDecimal']} EGP`
                                                            : `${product.price || 'N/A'} EGP`
                                                        }
                                                    </p>
                                                </div>
                                                {product.category && (
                                                    <div className="bg-white rounded-xl p-4 ">
                                                        <p className="text-sm text-gray-500 mb-1">Category</p>
                                                        <p className="text-lg font-semibold text-gray-800 capitalize">{String(product.category)}</p>
                                                    </div>
                                                )}
                                                {product.karat && (
                                                    <div className="bg-white rounded-xl p-4 ">
                                                        <p className="text-sm text-gray-500 mb-1">Karat</p>
                                                        <p className="text-lg font-semibold text-gray-800">{String(product.karat)}</p>
                                                    </div>
                                                )}
                                                {product.weight && (
                                                    <div className="bg-white rounded-xl p-4 ">
                                                        <p className="text-sm text-gray-500 mb-1">Weight</p>
                                                        <p className="text-lg font-semibold text-gray-800">
                                                            {typeof product.weight === 'object'
                                                                ? (product.weight['$numberDecimal'] ||
                                                                    product.weight.value ||
                                                                    Object.values(product.weight)[0] ||
                                                                    'N/A')
                                                                : String(product.weight)
                                                            } grams
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {product.description && (
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                                                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    Description
                                                </h4>
                                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                                            </div>
                                        )}

                                        {/* Additional Details */}
                                        {product.design_type && (
                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                                                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                                    Design Type
                                                </h4>
                                                <p className="text-gray-700 font-medium">{String(product.design_type)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Gallery Images */}
                                {product.images && product.images.length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Current Gallery ({product.images.length} images)
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {product.images.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={image}
                                                        alt={`Gallery ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-xl  group-hover: transition-all duration-200 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-200"></div>
                                                    <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <span className="text-xs font-semibold text-gray-800">#{index + 1}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <div className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] text-white px-6 py-2 rounded-full font-semibold ">
                        ✏️ Edit Product Information
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card className=" border-0 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-[#F8F4ED] to-[#F0E8DB] border-b border-[#E2D2B6]/30">
                            <CardTitle className="text-2xl font-bold text-gray-900">Product Information</CardTitle>
                            <CardDescription className="text-gray-600">
                                Update the basic details of your product
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Product Title *
                                    </label>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter product title"
                                        required
                                        className="h-12 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-xl text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Price *
                                    </label>
                                    <Input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="Enter price"
                                        required
                                        className="h-12 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-xl text-base"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your product..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C37C00] focus:border-[#C37C00] text-base resize-none"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Karat
                                    </label>
                                    <Input
                                        name="karat"
                                        value={formData.karat}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 18K, 21K"
                                        className="h-12 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-xl text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Weight (grams)
                                    </label>
                                    <div className="relative">
                                        <Input
                                            name="weight"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.weight}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 5.5, 10.25"
                                            className="h-12 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-xl text-base pr-12"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                                            g
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C37C00] focus:border-[#C37C00] text-base"
                                    >
                                        <option value="">{t('buttons.select_category') || 'Select category'}</option>
                                        <option value="rings">{t('product_categories.rings')}</option>
                                        <option value="necklaces">{t('product_categories.necklaces')}</option>
                                        <option value="bracelets">{t('product_categories.bracelets')}</option>
                                        <option value="earrings">{t('product_categories.earrings')}</option>
                                        <option value="chains">{t('product_categories.chains')}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Design Type
                                </label>
                                <Input
                                    name="design_type"
                                    value={formData.design_type}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Classic, Modern, Traditional"
                                    className="h-12 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-xl text-base"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Images Section */}
                    <Card className=" border-0 bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-[#F8F4ED] to-[#F0E8DB] border-b border-[#E2D2B6]/30">
                            <CardTitle className="text-2xl font-bold text-gray-900">Product Images</CardTitle>
                            <CardDescription className="text-gray-600">
                                Update product images and logo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Product Logo
                                </label>

                                {/* Current Logo Display */}
                                {product?.logoUrl && !logo && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                                        <img
                                            src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${product.logoUrl}`}
                                            alt="Current logo"
                                            className="w-32 h-32 object-cover rounded-xl "
                                        />
                                    </div>
                                )}

                                {/* New Logo Preview */}
                                {logo && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">New Logo Preview:</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={URL.createObjectURL(logo)}
                                                alt="New logo preview"
                                                className="w-32 h-32 object-cover rounded-xl "
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                                                onClick={() => setLogo(null)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="border-2 border-dashed border-[#C37C00]/30 rounded-xl p-6 bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC]">
                                    <div className="text-center">
                                        <Upload className="w-12 h-12 text-[#C37C00] mx-auto mb-4" />
                                        <p className="text-gray-700 mb-2">
                                            {product?.logoUrl ? 'Upload new logo to replace current one' : 'Upload product logo'}
                                        </p>
                                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                        id="logo-input"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('logo-input').click()}
                                    className="w-full mt-3 h-12 border-2 border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-xl font-semibold"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {product?.logoUrl ? 'Change Logo' : 'Choose Logo'}
                                </Button>
                            </div>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                                        Current Images
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {existingImages.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={image}
                                                    alt={`Current ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-xl  group-hover: transition- duration-200"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2 w-7 h-7 p-0 rounded-full  opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                    onClick={() => removeExistingImage(index)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Images Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Add New Images
                                </label>
                                <div className="border-2 border-dashed border-[#C37C00]/30 rounded-xl p-6 bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC]">
                                    <div className="text-center">
                                        <Upload className="w-12 h-12 text-[#C37C00] mx-auto mb-4" />
                                        <p className="text-gray-700 mb-2">Add additional images</p>
                                        <p className="text-sm text-gray-500">Select multiple images at once</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImagesChange}
                                        className="hidden"
                                        id="images-input"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('images-input').click()}
                                    className="w-full mt-3 h-12 border-2 border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-xl font-semibold"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Add New Images
                                </Button>

                                {/* New Images Preview */}
                                {images.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                            New Images Preview ({images.length} images)
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {images.map((image, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`New ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-xl  group-hover: transition- duration-200"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2 w-7 h-7 p-0 rounded-full  opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="bg-white rounded-2xl  border-0 p-8">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 h-14 bg-gradient-to-r from-[#C37C00] via-[#A66A00] to-[#8A5700] hover:from-[#A66A00] hover:via-[#8A5700] hover:to-[#6D4500] text-white rounded-xl font-bold text-lg  hover: transition-all duration-300 transform hover:scale-105"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        {loadingMessage}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-3" />
                                        Update Product
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(ROUTES.MANAGE_SHOP)}
                                className="h-14 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl font-semibold text-lg px-8"
                            >
                                Cancel
                            </Button>
                        </div>
                        <p className="text-sm text-gray-500 text-center mt-4">
                            Make sure all required fields are filled before updating the product
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { ArrowRight, Upload, X, Plus } from 'lucide-react';
import { shopService } from '../../services/shopService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import MapPicker from '../../components/ui/MapPicker.jsx';

const EditShop = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, isShopOwner } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [shop, setShop] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        whatsapp: '',
        workingHours: '',
        specialties: [''],
        image: null,
        gallery: [],
        latitude: null,
        longitude: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [commercialRecord, setCommercialRecord] = useState(null);
    const [currentCommercialRecord, setCurrentCommercialRecord] = useState(null);

    useEffect(() => {
        if (!user || !isShopOwner) {
            navigate(ROUTES.LOGIN);
            return;
        }
        loadShopData();
    }, [user, isShopOwner, navigate, id]);

    const loadShopData = async () => {
        try {
            setIsLoading(true);
            let shopData;

            if (id) {
                // Edit specific shop
                const response = await shopService.getShop(id);
                shopData = response.data || response;
            } else {
                // Edit user's shop - use the same logic as ManageShop
                try {
                    // Try to get user's shop first
                    try {
                        const userShopResponse = await shopService.getMyShop();
                        shopData = userShopResponse.data || userShopResponse;
                        console.log('User shop loaded:', shopData);
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
                            shopData = userShop;
                        } else {
                            console.log('No shop found for user, user needs to create one');
                            navigate(ROUTES.CREATE_SHOP);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('Error loading shop:', error);
                    navigate(ROUTES.CREATE_SHOP);
                    return;
                }
            }

            // Extract location data from GeoJSON format
            let latitude = null;
            let longitude = null;
            if (shopData.location && shopData.location.coordinates) {
                longitude = shopData.location.coordinates[0];
                latitude = shopData.location.coordinates[1];
            }

            setShop(shopData);
            setFormData({
                name: shopData.name || '',
                description: shopData.description || '',
                address: shopData.address || '',
                phone: shopData.phone || '',
                whatsapp: shopData.whatsapp || '',
                workingHours: shopData.workingHours || '',
                specialties: shopData.specialties && shopData.specialties.length > 0
                    ? shopData.specialties
                    : [''],
                image: null,
                gallery: [],
                latitude: latitude,
                longitude: longitude
            });

            if (shopData.image) {
                setImagePreview(shopData.image);
            }

            if (shopData.gallery && shopData.gallery.length > 0) {
                setGalleryPreviews(shopData.gallery);
            }

            // Set current commercial record if exists
            if (shopData.commercialRecord) {
                setCurrentCommercialRecord(shopData.commercialRecord);
            }

        } catch (error) {
            console.error('Error loading shop:', error);
            alert('خطأ في تحميل بيانات المتجر. يرجى إعادة المحاولة.');
            navigate(ROUTES.MANAGE_SHOP);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSpecialtyChange = (index, value) => {
        const newSpecialties = [...formData.specialties];
        newSpecialties[index] = value;
        setFormData(prev => ({
            ...prev,
            specialties: newSpecialties
        }));
    };

    const addSpecialty = () => {
        setFormData(prev => ({
            ...prev,
            specialties: [...prev.specialties, '']
        }));
    };

    const removeSpecialty = (index) => {
        if (formData.specialties.length > 1) {
            const newSpecialties = formData.specialties.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                specialties: newSpecialties
            }));
        }
    };

    const handleLocationChange = ({ latitude, longitude }) => {
        setFormData(prev => ({
            ...prev,
            latitude,
            longitude
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({
                ...prev,
                gallery: [...prev.gallery, ...files]
            }));

            // Create previews
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setGalleryPreviews(prev => [...prev, e.target.result]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeGalleryImage = (index) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    const handleCommercialRecordUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                alert('يرجى اختيار ملف PDF فقط للسجل التجاري');
                e.target.value = '';
                return;
            }

            // Validate file size (15MB limit as per backend)
            if (file.size > 15 * 1024 * 1024) {
                alert('حجم الملف كبير جداً. الحد الأقصى 15 ميجابايت');
                e.target.value = '';
                return;
            }

            setCommercialRecord(file);
        }
    };

    const removeCommercialRecord = () => {
        setCommercialRecord(null);
        // Reset the file input
        const fileInput = document.getElementById('commercial-record-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.description || !formData.address || !formData.phone) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            setIsLoading(true);

            // Check if we have files to upload
            const hasFiles = formData.image || formData.gallery.length > 0 || commercialRecord;

            if (hasFiles) {
                // Use FormData for file uploads
                const formDataToSend = new FormData();

                // Add basic shop data
                formDataToSend.append('name', formData.name);
                formDataToSend.append('description', formData.description);
                formDataToSend.append('address', formData.address);
                formDataToSend.append('phone', formData.phone);
                formDataToSend.append('whatsapp', formData.whatsapp || '');
                formDataToSend.append('workingHours', formData.workingHours || '');

                // Add specialties
                formData.specialties.filter(specialty => specialty.trim() !== '').forEach((specialty, index) => {
                    formDataToSend.append(`specialties[${index}]`, specialty);
                });

                // Add location data in GeoJSON format if coordinates exist
                if (formData.latitude && formData.longitude) {
                    const locationData = {
                        type: "Point",
                        coordinates: [formData.longitude, formData.latitude]
                    };
                    formDataToSend.append('location', JSON.stringify(locationData));
                }

                // Add files
                if (formData.image) {
                    formDataToSend.append('logo', formData.image);
                }

                formData.gallery.forEach((image) => {
                    formDataToSend.append('images', image);
                });

                if (commercialRecord) {
                    formDataToSend.append('commercialRecord', commercialRecord);
                }

                console.log('Updating shop with FormData:');
                for (const [key, value] of formDataToSend.entries()) {
                    console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
                }

                await shopService.updateShop(shop.id || shop._id, formDataToSend);
            } else {
                // Use regular JSON for updates without files
                const updateData = {
                    ...formData,
                    specialties: formData.specialties.filter(specialty => specialty.trim() !== '')
                };

                // Remove file objects and location fields for API call
                const { image, gallery, latitude, longitude, ...shopData } = updateData;

                // Add location data in GeoJSON format if coordinates exist
                if (latitude && longitude) {
                    shopData.location = {
                        type: "Point",
                        coordinates: [longitude, latitude] // [longitude, latitude] for GeoJSON
                    };
                }

                console.log('Updating shop with data:', shopData);
                await shopService.updateShop(shop.id || shop._id, shopData);
            }

            alert('تم تحديث معلومات المتجر بنجاح!');
            navigate(ROUTES.MANAGE_SHOP);

        } catch (error) {
            console.error('Error updating shop:', error);
            alert('خطأ في تحديث المتجر: ' + (error.message || 'خطأ غير معروف'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C37C00] mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل بيانات المتجر...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] via-[#FFFBF0] to-[#FFF0CC]" dir="rtl">
            {/* Professional Header Section */}
            <div className="relative bg-gradient-to-r from-[#C37C00] via-[#D4860A] to-[#A66A00] text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative w-full px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                onClick={() => navigate(ROUTES.MANAGE_SHOP)}
                                className="flex items-center gap-2 text-white hover:bg-white/20 border border-white/30 rounded-xl px-6 py-3 font-semibold transition-all duration-300"
                            >
                                <ArrowRight className="w-5 h-5" />
                                العودة للوحة التحكم
                            </Button>
                            <div className="h-8 w-px bg-white/30"></div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2">
                                    تعديل ملف المتجر
                                </h1>
                                <p className="text-white/90 text-lg">
                                    تحديث معلومات المتجر والموقع والوسائط
                                </p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="text-left">
                                <p className="text-sm text-white/80">حالة المتجر</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-semibold">نشط</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative z-10">

                {/* Professional Form Container */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="basic" className="w-full">
                            {/* Enhanced Tab Navigation */}
                            <div className="bg-gradient-to-r from-[#F8F4ED] via-[#FFF8E6] to-[#F0E8DB] border-b border-[#E2D2B6]/50">
                                <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-2">
                                    <TabsTrigger
                                        value="basic"
                                        className="data-[state=active]:bg-white data-[state=active]:text-[#C37C00] data-[state=active]:shadow-lg rounded-xl py-4 px-6 font-bold text-base transition-all duration-300 hover:bg-white/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-current rounded-full"></div>
                                            المعلومات الأساسية
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="details"
                                        className="data-[state=active]:bg-white data-[state=active]:text-[#C37C00] data-[state=active]:shadow-lg rounded-xl py-4 px-6 font-bold text-base transition-all duration-300 hover:bg-white/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-current rounded-full"></div>
                                            التفاصيل
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="location"
                                        className="data-[state=active]:bg-white data-[state=active]:text-[#C37C00] data-[state=active]:shadow-lg rounded-xl py-4 px-6 font-bold text-base transition-all duration-300 hover:bg-white/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-current rounded-full"></div>
                                            الموقع
                                        </div>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="media"
                                        className="data-[state=active]:bg-white data-[state=active]:text-[#C37C00] data-[state=active]:shadow-lg rounded-xl py-4 px-6 font-bold text-base transition-all duration-300 hover:bg-white/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-current rounded-full"></div>
                                            الوسائط
                                        </div>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="basic" className="p-0">
                                <div className="p-10">
                                    {/* Progress Indicator */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">المعلومات الأساسية</h2>
                                            <p className="text-gray-600">التفاصيل الأساسية حول متجرك</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#C37C00]/10 to-[#A66A00]/10 px-4 py-2 rounded-full">
                                            <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                                            <span className="text-sm font-semibold text-[#C37C00]">الخطوة 1 من 4</span>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Store Name & Phone Row */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                    <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                    اسم المتجر *
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        placeholder="أدخل اسم متجرك"
                                                        required
                                                        className="h-14 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-2xl text-base pl-12 pr-4 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                                    />
                                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                        <div className="w-1 h-6 bg-gradient-to-b from-[#C37C00] to-[#A66A00] rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                    <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                    رقم الهاتف *
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="أدخل رقم الهاتف"
                                                        required
                                                        className="h-14 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-2xl text-base pl-12 pr-4 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                                    />
                                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                        <div className="w-1 h-6 bg-gradient-to-b from-[#C37C00] to-[#A66A00] rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Store Description */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                وصف المتجر *
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="اكتب وصفاً لمتجرك والخدمات التي تقدمها وما يميزه..."
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C37C00] focus:border-[#C37C00] text-base resize-none font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                                    rows={5}
                                                    required
                                                />
                                                <div className="absolute top-4 left-4 pointer-events-none">
                                                    <div className="w-1 h-6 bg-gradient-to-b from-[#C37C00] to-[#A66A00] rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address & WhatsApp Row */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                    <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                    عنوان المتجر *
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        placeholder="أدخل العنوان الكامل للمتجر"
                                                        required
                                                        className="h-14 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-2xl text-base pl-12 pr-4 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                                    />
                                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                        <div className="w-1 h-6 bg-gradient-to-b from-[#C37C00] to-[#A66A00] rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                    رقم الواتساب
                                                    <span className="text-xs text-gray-500">(اختياري)</span>
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        name="whatsapp"
                                                        value={formData.whatsapp}
                                                        onChange={handleInputChange}
                                                        placeholder="رقم الواتساب للعملاء"
                                                        className="h-14 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-2xl text-base pl-12 pr-4 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                                    />
                                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                        <div className="w-1 h-6 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="details" className="p-0">
                                <div className="p-10">
                                    {/* Progress Indicator */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">تفاصيل المتجر</h2>
                                            <p className="text-gray-600">معلومات إضافية والتخصصات</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#C37C00]/10 to-[#A66A00]/10 px-4 py-2 rounded-full">
                                            <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                                            <span className="text-sm font-semibold text-[#C37C00]">الخطوة 2 من 4</span>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        {/* Working Hours */}
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                ساعات العمل
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    name="workingHours"
                                                    value={formData.workingHours}
                                                    onChange={handleInputChange}
                                                    placeholder="مثال: السبت - الخميس: 9:00 صباحاً - 10:00 مساءً"
                                                    className="h-14 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-2xl text-base pl-12 pr-4 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                                />
                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                    <div className="w-1 h-6 bg-gradient-to-b from-[#C37C00] to-[#A66A00] rounded-full"></div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 mr-4">اجعل العملاء يعرفون متى يكون متجرك مفتوحاً</p>
                                        </div>

                                        {/* Specialties Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                    <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                    تخصصات المتجر
                                                </label>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                    {formData.specialties.filter(s => s.trim()).length} تخصص
                                                </span>
                                            </div>

                                            <div className="space-y-4">
                                                {formData.specialties.map((specialty, index) => (
                                                    <div key={index} className="flex gap-4 items-center">
                                                        <div className="flex-1 relative">
                                                            <Input
                                                                value={specialty}
                                                                onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                                                                placeholder={`التخصص ${index + 1} (مثال: مجوهرات ذهبية، خواتم زفاف)`}
                                                                className="h-14 border-2 border-gray-200 focus:border-[#C37C00] focus:ring-[#C37C00] rounded-2xl text-base pl-12 pr-4 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                                                            />
                                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                                <div className="w-1 h-6 bg-gradient-to-b from-[#C37C00] to-[#A66A00] rounded-full"></div>
                                                            </div>
                                                        </div>
                                                        {formData.specialties.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeSpecialty(index)}
                                                                className="h-14 w-14 border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-2xl transition-all duration-200"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addSpecialty}
                                                    className="w-full h-14 border-2 border-dashed border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-2xl font-semibold text-base transition-all duration-300"
                                                >
                                                    <Plus className="w-5 h-5 ml-2" />
                                                    إضافة تخصص آخر
                                                </Button>
                                            </div>
                                            <p className="text-sm text-gray-500 mr-4">أضف ما يتخصص فيه متجرك لمساعدة العملاء في العثور عليك</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="location" className="p-0">
                                <div className="p-10">
                                    {/* Progress Indicator */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">موقع المتجر</h2>
                                            <p className="text-gray-600">ساعد العملاء في العثور على متجرك بسهولة</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#C37C00]/10 to-[#A66A00]/10 px-4 py-2 rounded-full">
                                            <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                                            <span className="text-sm font-semibold text-[#C37C00]">الخطوة 3 من 4</span>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Location Status */}
                                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#F8F4ED] to-[#FFF8E6] rounded-2xl border border-[#E2D2B6]/30">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.latitude && formData.longitude ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    <div className={`w-6 h-6 rounded-full ${formData.latitude && formData.longitude ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">
                                                        {formData.latitude && formData.longitude ? 'تم تحديد الموقع' : 'لم يتم تحديد الموقع'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {formData.latitude && formData.longitude
                                                            ? `الإحداثيات: ${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                                                            : 'انقر على الخريطة لتحديد موقع متجرك'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            {formData.latitude && formData.longitude && (
                                                <div className="text-green-600 text-2xl">✓</div>
                                            )}
                                        </div>

                                        {/* Map Container */}
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                الخريطة التفاعلية
                                            </label>
                                            <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                                                <MapPicker
                                                    latitude={formData.latitude || 30.0444}
                                                    longitude={formData.longitude || 31.2357}
                                                    onLocationChange={handleLocationChange}
                                                    height="500px"
                                                    showSearch={true}
                                                    showCurrentLocation={true}
                                                />
                                            </div>
                                        </div>

                                        {/* Instructions */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/30">
                                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                كيفية تحديد موقعك:
                                            </h4>
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-500 font-bold">1.</span>
                                                    <span>استخدم مربع البحث للعثور على عنوانك</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-500 font-bold">2.</span>
                                                    <span>انقر على "استخدام الموقع الحالي" لاستخدام موقعك الحالي</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-blue-500 font-bold">3.</span>
                                                    <span>أو ببساطة انقر في أي مكان على الخريطة لتحديد موقع متجرك</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="media" className="p-0">
                                <div className="p-10">
                                    {/* Progress Indicator */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">وسائط المتجر</h2>
                                            <p className="text-gray-600">اعرض متجرك بصور جميلة</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#C37C00]/10 to-[#A66A00]/10 px-4 py-2 rounded-full">
                                            <div className="w-2 h-2 bg-[#C37C00] rounded-full"></div>
                                            <span className="text-sm font-semibold text-[#C37C00]">الخطوة 4 من 4</span>
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        {/* Main Store Image */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                    <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                    الصورة الرئيسية للمتجر
                                                </label>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                    {imagePreview ? 'تم اختيار الصورة' : 'لا توجد صورة'}
                                                </span>
                                            </div>

                                            <div className="relative">
                                                <div className="border-2 border-dashed border-[#C37C00]/30 rounded-2xl p-8 bg-gradient-to-br from-[#FFF8E6] via-[#FFFBF0] to-[#FFF0CC] hover:from-[#FFF0CC] hover:to-[#FFE6B3] transition-all duration-300">
                                                    {imagePreview ? (
                                                        <div className="relative group">
                                                            <img
                                                                src={imagePreview}
                                                                alt="معاينة المتجر"
                                                                className="w-full h-80 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all duration-300"></div>
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                className="absolute top-4 left-4 rounded-full w-10 h-10 p-0 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                                onClick={() => {
                                                                    setImagePreview(null);
                                                                    setFormData(prev => ({ ...prev, image: null }));
                                                                }}
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <div className="w-24 h-24 bg-gradient-to-br from-[#C37C00]/20 to-[#A66A00]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                                                <Upload className="w-12 h-12 text-[#C37C00]" />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-2">رفع الصورة الرئيسية للمتجر</h3>
                                                            <p className="text-gray-600 mb-1">هذه ستكون الصورة الأساسية التي يراها العملاء</p>
                                                            <p className="text-sm text-gray-500">PNG, JPG, GIF حتى 10 ميجابايت • الحجم المقترح: 1200x800 بكسل</p>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                        id="main-image-input"
                                                    />
                                                </div>

                                                <div className="mt-6">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById('main-image-input').click()}
                                                        className="w-full h-14 border-2 border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-2xl font-bold text-base shadow-sm hover:shadow-md transition-all duration-300"
                                                    >
                                                        <Upload className="w-5 h-5 ml-3" />
                                                        {imagePreview ? 'تغيير الصورة الرئيسية' : 'اختيار الصورة الرئيسية'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Image Gallery */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                    <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                    معرض الصور
                                                </label>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                    {galleryPreviews.length} صورة
                                                </span>
                                            </div>

                                            <div className="relative">
                                                <div className="border-2 border-dashed border-[#C37C00]/30 rounded-2xl p-8 bg-gradient-to-br from-[#FFF8E6] via-[#FFFBF0] to-[#FFF0CC] hover:from-[#FFF0CC] hover:to-[#FFE6B3] transition-all duration-300">
                                                    <div className="text-center py-8">
                                                        <div className="w-20 h-20 bg-gradient-to-br from-[#C37C00]/20 to-[#A66A00]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                                            <Upload className="w-10 h-10 text-[#C37C00]" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2">إضافة صور المعرض</h3>
                                                        <p className="text-gray-600 mb-1">اعرض منتجاتك والتصميم الداخلي للمتجر</p>
                                                        <p className="text-sm text-gray-500">اختر عدة صور في نفس الوقت • PNG, JPG, GIF حتى 10 ميجابايت لكل صورة</p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleGalleryChange}
                                                        className="hidden"
                                                        id="gallery-input"
                                                    />
                                                </div>

                                                <div className="mt-6">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById('gallery-input').click()}
                                                        className="w-full h-14 border-2 border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white rounded-2xl font-bold text-base shadow-sm hover:shadow-md transition-all duration-300"
                                                    >
                                                        <Upload className="w-5 h-5 ml-3" />
                                                        {galleryPreviews.length > 0 ? 'إضافة المزيد من الصور' : 'إضافة صور المعرض'}
                                                    </Button>
                                                </div>
                                            </div>

                                            {galleryPreviews.length > 0 && (
                                                <div className="mt-10">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h4 className="text-lg font-bold text-gray-900">
                                                            معاينة المعرض
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-500">{galleryPreviews.length} صورة</span>
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                                        {galleryPreviews.map((preview, index) => (
                                                            <div key={index} className="relative group">
                                                                <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                                                                    <img
                                                                        src={preview}
                                                                        alt={`المعرض ${index + 1}`}
                                                                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="absolute top-3 left-3 w-8 h-8 p-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                                                                        onClick={() => removeGalleryImage(index)}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                                        #{index + 1}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-200">
                                                        <p className="text-sm text-green-700 flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            صور المعرض ستساعد العملاء على رؤية منتجاتك وأجواء المتجر
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Commercial Record */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                                    <div className="w-1.5 h-1.5 bg-[#C37C00] rounded-full"></div>
                                                    السجل التجاري (PDF) *
                                                </label>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                    {commercialRecord ? 'تم اختيار PDF جديد' : currentCommercialRecord ? 'PDF حالي' : 'لا يوجد PDF'}
                                                </span>
                                            </div>

                                            <div className="relative">
                                                <div className="border-2 border-dashed border-[#C37C00]/30 rounded-2xl p-8 bg-gradient-to-br from-[#FFF8E6] via-[#FFFBF0] to-[#FFF0CC] hover:from-[#FFF0CC] hover:to-[#FFE6B3] transition-all duration-300">
                                                    {commercialRecord ? (
                                                        <div className="relative group">
                                                            <div className="p-6 bg-green-50 border border-green-200 rounded-2xl">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center ml-4">
                                                                            <span className="text-red-600 font-bold text-sm">PDF</span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-gray-900">{commercialRecord.name}</p>
                                                                            <p className="text-xs text-gray-500">
                                                                                {(commercialRecord.size / (1024 * 1024)).toFixed(2)} ميجابايت
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={removeCommercialRecord}
                                                                        className="rounded-full w-8 h-8 p-0"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : currentCommercialRecord ? (
                                                        <div className="text-center py-8">
                                                            <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                                <span className="text-2xl font-bold text-green-600">PDF</span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-2">السجل التجاري الحالي</h3>
                                                            <p className="text-gray-600 mb-1">تم رفع السجل التجاري مسبقاً</p>
                                                            <p className="text-sm text-gray-500">ارفع ملف PDF جديد لاستبدال الحالي</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                                                <Upload className="w-12 h-12 text-red-600" />
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-2">رفع السجل التجاري</h3>
                                                            <p className="text-gray-600 mb-1">وثيقة قانونية مطلوبة لمتجرك</p>
                                                            <p className="text-sm text-gray-500">صيغة PDF فقط • الحد الأقصى 15 ميجابايت</p>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="application/pdf"
                                                        onChange={handleCommercialRecordUpload}
                                                        className="hidden"
                                                        id="commercial-record-upload"
                                                    />
                                                </div>

                                                <div className="mt-6">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById('commercial-record-upload').click()}
                                                        className="w-full h-14 border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-2xl font-bold text-base transition-all duration-300"
                                                    >
                                                        <Upload className="w-5 h-5 ml-3" />
                                                        {commercialRecord ? 'تغيير السجل التجاري' : currentCommercialRecord ? 'استبدال السجل التجاري' : 'رفع السجل التجاري'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Professional Submit Section */}
                        <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 p-10 mt-8">
                            <div className="max-w-2xl mx-auto">
                                {/* Progress Summary */}
                                <div className="flex items-center justify-center gap-8 mb-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#C37C00] rounded-full"></div>
                                        <span className="text-sm font-semibold text-gray-700">المعلومات الأساسية</span>
                                    </div>
                                    <div className="w-8 h-px bg-gray-300"></div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#C37C00] rounded-full"></div>
                                        <span className="text-sm font-semibold text-gray-700">التفاصيل</span>
                                    </div>
                                    <div className="w-8 h-px bg-gray-300"></div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#C37C00] rounded-full"></div>
                                        <span className="text-sm font-semibold text-gray-700">الموقع</span>
                                    </div>
                                    <div className="w-8 h-px bg-gray-300"></div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-[#C37C00] rounded-full"></div>
                                        <span className="text-sm font-semibold text-gray-700">الوسائط</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 h-16 bg-gradient-to-r from-[#C37C00] via-[#D4860A] to-[#A66A00] hover:from-[#A66A00] hover:via-[#B8750A] hover:to-[#8A5700] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white ml-3"></div>
                                                <span>جاري تحديث المتجر...</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center ml-3">
                                                    <Upload className="w-4 h-4" />
                                                </div>
                                                <span>تحديث ملف المتجر</span>
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(ROUTES.MANAGE_SHOP)}
                                        className="h-16 border-2 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 hover:shadow-md rounded-2xl font-bold text-lg px-12 transition-all duration-300"
                                    >
                                        إلغاء التغييرات
                                    </Button>
                                </div>

                                {/* Help Text */}
                                <div className="mt-8 text-center">
                                    <p className="text-sm text-gray-600 mb-2">
                                        ✓ سيتم حفظ جميع التغييرات فوراً بعد النقر على "تحديث ملف المتجر"
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        تأكد من إكمال جميع الحقول المطلوبة قبل الإرسال
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditShop;
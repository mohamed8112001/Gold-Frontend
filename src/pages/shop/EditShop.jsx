import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
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
                // Edit user's shop
                try {
                    const response = await shopService.getMyShop();
                    shopData = response.data || response;
                } catch (error) {
                    console.error('No shop found for user');
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

        } catch (error) {
            console.error('Error loading shop:', error);
            alert('حدث خطأ في تحميل بيانات المتجر');
            navigate(ROUTES.DASHBOARD);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.description || !formData.address || !formData.phone) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            setIsLoading(true);

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

            // TODO: Handle image upload separately if needed
            // if (image) {
            //     await shopService.uploadShopImage(shop.id, image);
            // }

            alert('تم تحديث بيانات المتجر بنجاح!');
            navigate(ROUTES.DASHBOARD);

        } catch (error) {
            console.error('Error updating shop:', error);
            alert('حدث خطأ في تحديث المتجر: ' + (error.message || 'خطأ غير معروف'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل بيانات المتجر...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="outline"
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        العودة
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            تحديث بيانات المتجر
                        </h1>
                        <p className="text-gray-600">
                            تحديث معلومات متجرك وإعداداته
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="basic" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
                            <TabsTrigger value="details">التفاصيل</TabsTrigger>
                            <TabsTrigger value="location">الموقع</TabsTrigger>
                            <TabsTrigger value="media">الصور</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>المعلومات الأساسية</CardTitle>
                                    <CardDescription>
                                        المعلومات الأساسية لمتجرك
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            اسم المتجر *
                                        </label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="اسم المتجر"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            وصف المتجر *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="وصف مفصل عن المتجر وخدماته"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            العنوان *
                                        </label>
                                        <Input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="عنوان المتجر"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رقم الهاتف *
                                        </label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="رقم الهاتف"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رقم الواتساب
                                        </label>
                                        <Input
                                            name="whatsapp"
                                            value={formData.whatsapp}
                                            onChange={handleInputChange}
                                            placeholder="رقم الواتساب"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>تفاصيل إضافية</CardTitle>
                                    <CardDescription>
                                        معلومات إضافية عن المتجر
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ساعات العمل
                                        </label>
                                        <Input
                                            name="workingHours"
                                            value={formData.workingHours}
                                            onChange={handleInputChange}
                                            placeholder="مثال: السبت - الخميس: 9:00 ص - 10:00 م"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            التخصصات
                                        </label>
                                        <div className="space-y-2">
                                            {formData.specialties.map((specialty, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        value={specialty}
                                                        onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                                                        placeholder="تخصص المتجر"
                                                        className="flex-1"
                                                    />
                                                    {formData.specialties.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeSpecialty(index)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addSpecialty}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                إضافة تخصص
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="location" className="space-y-6">
                            <MapPicker
                                latitude={formData.latitude || 30.0444}
                                longitude={formData.longitude || 31.2357}
                                onLocationChange={handleLocationChange}
                                height="400px"
                                showSearch={true}
                                showCurrentLocation={true}
                            />
                        </TabsContent>

                        <TabsContent value="media" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>صور المتجر</CardTitle>
                                    <CardDescription>
                                        إضافة وتحديث صور المتجر
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Main Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الصورة الرئيسية
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                            {imagePreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={imagePreview}
                                                        alt="معاينة الصورة"
                                                        className="w-full h-48 object-cover rounded-lg"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => {
                                                            setImagePreview(null);
                                                            setFormData(prev => ({ ...prev, image: null }));
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-600 mb-2">اضغط لرفع صورة أو اسحب الصورة هنا</p>
                                                    <p className="text-sm text-gray-500">PNG, JPG, GIF حتى 10MB</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Gallery */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            معرض الصور
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                            <div className="text-center mb-4">
                                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-600">إضافة صور للمعرض</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleGalleryChange}
                                                className="w-full"
                                            />
                                        </div>

                                        {galleryPreviews.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                                                {galleryPreviews.map((preview, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={preview}
                                                            alt={`معرض ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            className="absolute top-1 right-1 w-6 h-6 p-0"
                                                            onClick={() => removeGalleryImage(index)}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-6">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? 'جاري التحديث...' : 'تحديث المتجر'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(ROUTES.DASHBOARD)}
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditShop;

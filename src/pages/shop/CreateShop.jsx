import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import {
    Save,
    ArrowLeft,
    Upload,
    X,
    Plus,
    MapPin,
    Phone,
    Clock
} from 'lucide-react';
import { shopService } from '../../services/shopService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import MapPicker from '../../components/ui/MapPicker.jsx';

const CreateShop = () => {
    const navigate = useNavigate();
    const { user, isShopOwner } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        city: '',
        area: '',
        address: '',
        phone: '',
        whatsapp: '',
        workingHours: '',
        specialties: [''],
        latitude: null,
        longitude: null
    });
    const [logo, setLogo] = useState(null);
    const [images, setImages] = useState([]);
    const [commercialRecord, setCommercialRecord] = useState(null);

    React.useEffect(() => {
        if (!user || !isShopOwner) {
            navigate(ROUTES.LOGIN);
            return;
        }
    }, [user, isShopOwner, navigate]);

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

    const handleLocationChange = ({ latitude, longitude }) => {
        setFormData(prev => ({
            ...prev,
            latitude,
            longitude
        }));
    };

    const removeSpecialty = (index) => {
        const newSpecialties = formData.specialties.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            specialties: newSpecialties
        }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
        }
    };

    const removeLogo = () => {
        setLogo(null);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
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

        if (!formData.name || !formData.description || !formData.address || !formData.phone) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        if (!logo) {
            alert('يرجى اختيار شعار للمتجر');
            return;
        }

        if (!commercialRecord) {
            alert('يرجى تحميل السجل التجاري (ملف PDF)');
            return;
        }

        try {
            setIsLoading(true);

            // Create FormData object for multipart/form-data
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('area', formData.area);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('whatsapp', formData.whatsapp);
            formDataToSend.append('workingHours', formData.workingHours);
            formData.specialties.filter(specialty => specialty.trim() !== '').forEach((specialty, index) => {
                formDataToSend.append(`specialties[${index}]`, specialty);
            });

            // Append location data in GeoJSON format
            if (formData.latitude && formData.longitude) {
                const locationData = {
                    type: "Point",
                    coordinates: [formData.longitude, formData.latitude] // [longitude, latitude] for GeoJSON
                };
                formDataToSend.append('location', JSON.stringify(locationData));
            }

            // Append logo file
            if (logo) {
                formDataToSend.append('logo', logo);
            }

            // Append image files
            images.forEach((image) => {
                formDataToSend.append('images', image);
            });

            // Append commercial record file
            if (commercialRecord) {
                formDataToSend.append('commercialRecord', commercialRecord);
            }

            console.log('Creating shop with FormData:');
            for (const [key, value] of formDataToSend.entries()) {
                console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
            }

            const response = await shopService.createShop(formDataToSend);
            console.log('Shop creation response:', response);

            // Double-check the response
            if (response && response.data) {
                console.log('Created shop status check:', {
                    status: response.data.status,
                    approved: response.data.isApproved,
                    isActive: response.data.isActive
                });
            }

            alert(
                'تم إرسال طلب إنشاء المتجر بنجاح!\n\n' +
                '📋 سيتم مراجعة طلبك من قبل الإدارة خلال 24-48 ساعة\n' +
                '📄 تم رفع السجل التجاري والمستندات المطلوبة\n' +
                '🔔 ستتلقى إشعاراً عند الموافقة على المتجر\n\n' +
                'يمكنك متابعة حالة الطلب من لوحة التحكم'
            );
            navigate(ROUTES.DASHBOARD);
        } catch (error) {
            console.error('Error creating shop:', error);

            // Extract error message from response
            let errorMessage = 'حدث خطأ أثناء إنشاء المتجر';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full px-2 sm:px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        العودة
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">إنشاء متجر جديد</h1>
                    <p className="text-gray-600">أنشئ متجرك الخاص لبيع المجوهرات والذهب</p>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>المعلومات الأساسية</CardTitle>
                            <CardDescription>
                                أدخل المعلومات الأساسية لمتجرك
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
                                    placeholder="أدخل اسم المتجر"
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
                                    placeholder="اكتب وصفاً مفصلاً عن متجرك وما يميزه"
                                    className="w-full p-3 border border-gray-300 rounded-md resize-none h-32"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>معلومات الاتصال</CardTitle>
                            <CardDescription>
                                أدخل معلومات الاتصال والموقع
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        المدينة *
                                    </label>
                                    <Input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="أدخل المدينة (مثل: الرياض)"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        المنطقة *
                                    </label>
                                    <Input
                                        name="area"
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        placeholder="أدخل المنطقة (مثل: وسط المدينة)"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    العنوان *
                                </label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="أدخل عنوان المتجر بالتفصيل"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        رقم الهاتف *
                                    </label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+966 123 456 789"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        واتساب
                                    </label>
                                    <Input
                                        name="whatsapp"
                                        value={formData.whatsapp}
                                        onChange={handleInputChange}
                                        placeholder="+966 987 654 321"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    ساعات العمل
                                </label>
                                <Input
                                    name="workingHours"
                                    value={formData.workingHours}
                                    onChange={handleInputChange}
                                    placeholder="مثل: السبت - الخميس: 10:00 ص - 10:00 م"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Specialties */}
                    <Card>
                        <CardHeader>
                            <CardTitle>التخصصات</CardTitle>
                            <CardDescription>
                                أضف التخصصات والمنتجات التي يقدمها متجرك
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.specialties.map((specialty, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={specialty}
                                        onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                                        placeholder="مثل: خواتم الخطوبة، السلاسل الذهبية"
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
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>صور المتجر</CardTitle>
                            <CardDescription>
                                أضف شعار المتجر وصوراً إضافية (اختياري)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    شعار المتجر
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">اسحب شعار المتجر أو انقر للاختيار</p>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('logo-upload').click()}
                                    >
                                        اختيار الشعار
                                    </Button>
                                </div>
                                {logo && (
                                    <div className="relative mt-4">
                                        <img
                                            src={URL.createObjectURL(logo)}
                                            alt="Logo Preview"
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                                            onClick={removeLogo}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Images Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    صور إضافية
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">اسحب الصور هنا أو انقر للاختيار</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('image-upload').click()}
                                    >
                                        اختيار الصور
                                    </Button>
                                </div>
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mt-4">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                                                    onClick={() => removeImage(index)}
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

                    {/* Commercial Record */}
                    <Card>
                        <CardHeader>
                            <CardTitle>السجل التجاري</CardTitle>
                            <CardDescription>
                                يرجى تحميل السجل التجاري للمتجر (ملف PDF فقط) *
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ملف السجل التجاري (PDF) *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">اسحب ملف السجل التجاري أو انقر للاختيار</p>
                                    <p className="text-sm text-gray-500 mb-4">يجب أن يكون الملف بصيغة PDF وحجم أقل من 15 ميجابايت</p>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleCommercialRecordUpload}
                                        className="hidden"
                                        id="commercial-record-upload"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('commercial-record-upload').click()}
                                    >
                                        اختيار ملف PDF
                                    </Button>
                                </div>
                                {commercialRecord && (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                                    <span className="text-red-600 font-semibold text-sm">PDF</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{commercialRecord.name}</p>
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
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Map */}
                    <MapPicker
                        latitude={formData.latitude || 30.0444}
                        longitude={formData.longitude || 31.2357}
                        onLocationChange={handleLocationChange}
                        height="400px"
                        showSearch={true}
                        showCurrentLocation={true}
                    />

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isLoading ? 'جاري الإنشاء...' : 'إنشاء المتجر'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateShop;
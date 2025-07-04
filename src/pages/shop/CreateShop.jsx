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
    Mail,
    Clock
} from 'lucide-react';
import { shopService } from '../../services/shopService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const CreateShop = () => {
    const navigate = useNavigate();
    const { user, isShopOwner } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        workingHours: '',
        specialties: ['']
    });
    const [images, setImages] = useState([]);

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

    const removeSpecialty = (index) => {
        const newSpecialties = formData.specialties.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            specialties: newSpecialties
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.address || !formData.phone) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            setIsLoading(true);

            const shopData = {
                ...formData,
                specialties: formData.specialties.filter(specialty => specialty.trim() !== '')
            };

            await shopService.createShop(shopData);
            navigate(ROUTES.DASHBOARD);
        } catch (error) {
            console.error('Error creating shop:', error);
            alert('حدث خطأ في إنشاء المتجر');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                <form onSubmit={handleSubmit} className="space-y-8">
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
                                        placeholder="+20 1XX XXX XXXX"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        البريد الإلكتروني
                                    </label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="shop@example.com"
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
                                أضف صوراً لمتجرك ومنتجاتك (اختياري)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">اسحب الصور هنا أو انقر للاختيار</p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
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
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        </CardContent>
                    </Card>

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
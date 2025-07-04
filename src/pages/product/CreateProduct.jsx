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
    Plus
} from 'lucide-react';
import { productService } from '../../services/productService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const CreateProduct = () => {
    const navigate = useNavigate();
    const { user, isShopOwner } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        weight: '',
        karat: '',
        material: '',
        specifications: {},
        features: ['']
    });
    const [images, setImages] = useState([]);

    React.useEffect(() => {
        if (!user || !isShopOwner) {
            navigate(ROUTES.LOGIN);
            return;
        }
    }, [user, isShopOwner, navigate]);

    const categories = [
        { value: 'rings', label: 'خواتم' },
        { value: 'chains', label: 'سلاسل' },
        { value: 'bracelets', label: 'أساور' },
        { value: 'earrings', label: 'أقراط' },
        { value: 'necklaces', label: 'قلادات' },
        { value: 'sets', label: 'طقم' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({
            ...prev,
            features: newFeatures
        }));
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeature = (index) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            features: newFeatures
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

        if (!formData.name || !formData.description || !formData.price || !formData.category) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            setIsLoading(true);

            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                features: formData.features.filter(feature => feature.trim() !== ''),
                specifications: {
                    weight: formData.weight,
                    karat: formData.karat,
                    material: formData.material
                }
            };

            await productService.createProduct(productData);
            navigate(ROUTES.DASHBOARD);
        } catch (error) {
            console.error('Error creating product:', error);
            alert('حدث خطأ في إنشاء المنتج');
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">إضافة منتج جديد</h1>
                    <p className="text-gray-600">أضف منتجاً جديداً إلى متجرك</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>المعلومات الأساسية</CardTitle>
                            <CardDescription>
                                أدخل المعلومات الأساسية للمنتج
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم المنتج *
                                    </label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="أدخل اسم المنتج"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الفئة *
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="">اختر الفئة</option>
                                        {categories.map((category) => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        السعر (ج.م) *
                                    </label>
                                    <Input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الوزن (جرام)
                                    </label>
                                    <Input
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        placeholder="الوزن بالجرام"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        العيار
                                    </label>
                                    <select
                                        name="karat"
                                        value={formData.karat}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="">اختر العيار</option>
                                        <option value="18">18 قيراط</option>
                                        <option value="21">21 قيراط</option>
                                        <option value="22">22 قيراط</option>
                                        <option value="24">24 قيراط</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        المادة
                                    </label>
                                    <Input
                                        name="material"
                                        value={formData.material}
                                        onChange={handleInputChange}
                                        placeholder="مثل: ذهب أصفر، ذهب أبيض"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="اكتب وصفاً مفصلاً للمنتج"
                                    className="w-full p-3 border border-gray-300 rounded-md resize-none h-32"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Features */}
                    <Card>
                        <CardHeader>
                            <CardTitle>المميزات</CardTitle>
                            <CardDescription>
                                أضف المميزات الخاصة بالمنتج
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        placeholder="أدخل ميزة المنتج"
                                        className="flex-1"
                                    />
                                    {formData.features.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeFeature(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addFeature}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                إضافة ميزة
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>صور المنتج</CardTitle>
                            <CardDescription>
                                أضف صوراً للمنتج (اختياري)
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
                            {isLoading ? 'جاري الحفظ...' : 'حفظ المنتج'}
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

export default CreateProduct;
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
import { shopService } from '../../services/shopService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const CreateProduct = () => {
    const navigate = useNavigate();
    const { user, isShopOwner } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('جاري الحفظ...');
    const [userShop, setUserShop] = useState(null);
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
        loadUserShop();
    }, [user, isShopOwner, navigate]);

    const loadUserShop = async () => {
        try {
            console.log('🏪 Loading user shop for product creation...');

            // Try to get user's shop
            try {
                const response = await shopService.getAllShops();
                const shopsData = Array.isArray(response) ? response : response.data || [];

                // Find user's shop
                const userShopData = shopsData.find(shop =>
                    shop.owner === user.id ||
                    shop.owner?._id === user.id ||
                    shop.ownerId === user.id
                );

                if (userShopData) {
                    console.log(' User shop found:', userShopData.name);
                    setUserShop(userShopData);
                } else {
                    console.error(' No shop found for user');
                    alert('يجب أن يكون لديك متجر لإضافة منتجات. يرجى إنشاء متجر أولاً.');
                    navigate(ROUTES.CREATE_SHOP);
                }
            } catch (error) {
                console.error(' Error loading user shop:', error);
                alert('خطأ في تحميل بيانات المتجر');
            }
        } catch (error) {
            console.error(' Error in loadUserShop:', error);
        }
    };

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

        // التحقق من الحقول المطلوبة (الوصف أصبح اختياري)
        if (!formData.name || !formData.price) {
            alert('يرجى ملء جميع الحقول المطلوبة (اسم المنتج والسعر)');
            return;
        }

        if (!userShop) {
            alert('لم يتم العثور على متجرك. يرجى إنشاء متجر أولاً.');
            return;
        }

        if (!formData.karat) {
            alert('يرجى اختيار العيار');
            return;
        }

        if (!formData.weight) {
            alert('يرجى إدخال الوزن');
            return;
        }

        try {
            setIsLoading(true);

            // تحديد رسالة التحميل بناءً على ما إذا كان سيتم توليد الوصف أم لا
            const willGenerateAI = !formData.description || formData.description.trim() === '';
            setLoadingMessage(willGenerateAI ? 'جاري توليد الوصف بالذكاء الاصطناعي...' : 'جاري حفظ المنتج...');

            console.log(' Creating product with data:', {
                title: formData.name,
                description: formData.description || '[سيتم التوليد التلقائي]',
                price: formData.price,
                karat: formData.karat,
                weight: formData.weight,
                design_type: formData.category,
                shop: userShop._id || userShop.id,
                willGenerateAI: !formData.description || formData.description.trim() === ''
            });

            // تحضير البيانات بالتنسيق المطلوب للباك إند
            const productData = {
                title: formData.name, // الباك إند يتوقع title وليس name
                // إذا كان الوصف فارغاً، لا نرسله أصلاً ليقوم الباك إند بتوليده تلقائياً
                ...(formData.description && formData.description.trim() !== ''
                    ? { description: formData.description }
                    : {}),
                price: parseFloat(formData.price),
                karat: formData.karat, // يجب أن يكون بتنسيق "18K", "21K", "24K"
                weight: parseFloat(formData.weight),
                design_type: formData.category || 'other', // الباك إند يتوقع design_type
                category: formData.category || formData.material || 'other',
                images_urls: [], // سيتم إضافة الصور لاحقاً
                shop: userShop._id || userShop.id // معرف المتجر مطلوب
            };

            console.log(' Final product data:', productData);

            const response = await productService.createProduct(productData);
            console.log(' Product created successfully:', response);

            // رسالة نجاح مختلفة بناءً على ما إذا كان الوصف تم توليده تلقائياً أم لا
            const successMessage = formData.description
                ? 'تم إنشاء المنتج بنجاح!'
                : 'تم إنشاء المنتج بنجاح! تم توليد الوصف تلقائياً باستخدام الذكاء الاصطناعي.';

            alert(successMessage);
            navigate(ROUTES.DASHBOARD);
        } catch (error) {
            console.error(' Error creating product:', error);

            // معالجة خاصة لخطأ توليد الوصف التلقائي
            if (error.message.includes('Failed to generate AI description')) {
                console.error(' AI Description Error Details:', {
                    error: error.message,
                    productData: productData,
                    hasOpenAIKey: !!process.env.VITE_OPENAI_API_KEY,
                    timestamp: new Date().toISOString()
                });

                const choice = window.confirm(
                    ' فشل في توليد الوصف التلقائي\n\n' +
                    ' الأسباب المحتملة:\n' +
                    '• مفتاح OpenAI API غير صحيح أو منتهي الصلاحية\n' +
                    '• نفاد الرصيد في حساب OpenAI\n' +
                    '• مشكلة في الاتصال بالإنترنت\n' +
                    '• خطأ مؤقت في خدمة OpenAI\n\n' +
                    ' الحلول المتاحة:\n' +
                    'موافق = إضافة وصف يدوياً\n' +
                    'إلغاء = إنشاء المنتج بوصف افتراضي'
                );

                if (choice) {
                    // إضافة وصف يدوياً
                    const descriptionField = document.querySelector('textarea[name="description"]');
                    if (descriptionField) {
                        descriptionField.focus();
                        descriptionField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // إضافة تلميح بصري
                        descriptionField.style.borderColor = '#f59e0b';
                        descriptionField.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                        setTimeout(() => {
                            descriptionField.style.borderColor = '';
                            descriptionField.style.boxShadow = '';
                        }, 3000);
                    }
                    alert(' يرجى إضافة وصف للمنتج في الحقل المميز أعلاه ثم المحاولة مرة أخرى.');
                } else {
                    // إنشاء وصف افتراضي وإعادة المحاولة
                    const categoryLabel = categories.find(cat => cat.value === formData.category)?.label || formData.category;
                    const defaultDescription = `${formData.name} - ${categoryLabel} من الذهب عيار ${formData.karat} بوزن ${formData.weight} جرام. منتج عالي الجودة بسعر ${formData.price} جنيه مصري.`;

                    const confirmDefault = window.confirm(
                        ` سيتم إنشاء المنتج بالوصف التالي:\n\n"${defaultDescription}"\n\n هل تريد المتابعة؟`
                    );

                    if (confirmDefault) {
                        // تحديث البيانات بالوصف الافتراضي وإعادة المحاولة
                        const updatedProductData = {
                            ...productData,
                            description: defaultDescription
                        };

                        try {
                            const response = await productService.createProduct(updatedProductData);
                            console.log(' Product created with default description:', response);
                            alert(' تم إنشاء المنتج بنجاح بوصف افتراضي!\n\nيمكنك تعديل الوصف لاحقاً من لوحة التحكم.');
                            navigate(ROUTES.DASHBOARD);
                            return;
                        } catch (retryError) {
                            console.error(' Retry failed:', retryError);
                            alert(`فشل في إنشاء المنتج: ${retryError.message}`);
                        }
                    }
                }
            } else {
                // أخطاء أخرى
                console.error(' General Product Creation Error:', error);
                alert(` حدث خطأ في إنشاء المنتج: ${error.message}\n\nيرجى التحقق من البيانات والمحاولة مرة أخرى.`);
            }
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
                    <p className="text-gray-600">
                        أضف منتجاً جديداً إلى متجرك
                        {userShop && (
                            <span className="text-yellow-600 font-medium"> - {userShop.name}</span>
                        )}
                    </p>
                    {!userShop && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 text-sm">
                             جاري تحميل بيانات المتجر...
                            </p>
                        </div>
                    )}
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
                                        <option value="18K">18 قيراط</option>
                                        <option value="21K">21 قيراط</option>
                                        <option value="24K">24 قيراط</option>
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
                                    الوصف
                                    <span className="text-gray-500 text-sm font-normal"> (اختياري)</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="اكتب وصفاً مفصلاً للمنتج، أو اتركه فارغاً ليتم توليده تلقائياً بالذكاء الاصطناعي"
                                        className={`w-full p-3 border rounded-md resize-none h-32 ${
                                            formData.description.trim() === ''
                                                ? 'border-blue-300 bg-blue-50'
                                                : 'border-gray-300'
                                        }`}
                                    />
                                    {formData.description.trim() === '' && (
                                        <div className="absolute top-2 left-2 flex items-center text-blue-600 text-xs">
                                            <span className="bg-blue-100 px-2 py-1 rounded-full">
                                                 سيتم التوليد التلقائي
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                         <strong>نصيحة:</strong> إذا تركت هذا الحقل فارغاً، سيتم توليد وصف تلقائي للمنتج باستخدام الذكاء الاصطناعي بناءً على اسم المنتج والفئة والسعر.
                                    </p>
                                    {formData.description.trim() === '' && (formData.name || formData.category || formData.price) && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm font-medium text-blue-800 mb-2">
                                                 معاينة البيانات للتوليد التلقائي:
                                            </p>
                                            <ul className="text-sm text-blue-700 space-y-1">
                                                {formData.name && (
                                                    <li>• <strong>اسم المنتج:</strong> {formData.name}</li>
                                                )}
                                                {formData.category && (
                                                    <li>• <strong>الفئة:</strong> {categories.find(cat => cat.value === formData.category)?.label || formData.category}</li>
                                                )}
                                                {formData.price && (
                                                    <li>• <strong>السعر:</strong> {formData.price} ج.م</li>
                                                )}
                                                {formData.karat && (
                                                    <li>• <strong>العيار:</strong> {formData.karat}</li>
                                                )}
                                                {formData.weight && (
                                                    <li>• <strong>الوزن:</strong> {formData.weight} جرام</li>
                                                )}
                                            </ul>
                                            <div className="mt-3 pt-3 border-t border-blue-200">
                                                <p className="text-xs text-blue-600">
                                                     <strong>ملاحظة:</strong> إذا فشل التوليد التلقائي، يمكنك إضافة وصف يدوياً أو إنشاء المنتج بدون وصف وإضافته لاحقاً.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                            {isLoading ? loadingMessage : 'حفظ المنتج'}
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
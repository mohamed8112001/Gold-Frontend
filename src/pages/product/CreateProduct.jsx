import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateProduct = () => {
    const navigate = useNavigate();
    const { user, isShopOwner } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('جاري الحفظ...');
    const [userShop, setUserShop] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        karat: '',
        weight: '',
        design_type: '',
        category: ''
    });
    const [logo, setLogo] = useState(null); // Single logo file
    const [images, setImages] = useState([]); // Multiple image files

    useEffect(() => {
        if (!user || !isShopOwner) {
            navigate(ROUTES.LOGIN);
            return;
        }

        // Check if user has paid
        if (!user.paid) {
            alert('يجب إتمام عملية الدفع أولاً لإضافة المنتجات');
            navigate('/owner-payment');
            return;
        }

        loadUserShop();
    }, [user, isShopOwner, navigate]);

    const loadUserShop = async () => {
        try {
            console.log('🏪 Loading user shop for product creation...');
            const response = await shopService.getAllShops();
            const shopsData = Array.isArray(response) ? response : response.data || [];
            const userShopData = shopsData.find(shop =>
                shop.owner === user.id ||
                shop.owner?._id === user.id ||
                shop.ownerId === user.id
            );

            if (userShopData) {
                console.log('User shop found:', userShopData.name);

                // Check shop approval status
                if (userShopData.requestStatus !== 'approved') {
                    let message = 'لا يمكن إضافة منتجات حتى يتم اعتماد المتجر من قبل الإدارة.';

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
                console.error('No shop found for user');
                alert('يجب أن يكون لديك متجر لإضافة منتجات. يرجى إنشاء متجر أولاً.');
                navigate(ROUTES.CREATE_SHOP);
            }
        } catch (error) {
            console.error('Error loading user shop:', error);
            alert('خطأ في تحميل بيانات المتجر');
        }
    };

    const categories = [
        { value: 'rings', label: 'خواتم' },
        { value: 'chains', label: 'سلاسل' },
        { value: 'bracelets', label: 'أساور' },
        { value: 'earrings', label: 'أقراط' },
        { value: 'necklaces', label: 'قلادات' },
        { value: 'pendants', label: 'معلقات' },
        { value: 'sets', label: 'طقم' },
        { value: 'watches', label: 'ساعات' },
        { value: 'other', label: 'أخرى' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed: ${name}=${value}`); // Debug
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Uploaded logo:', file.name); // Debug
            setLogo(file);
        }
    };

    const removeLogo = () => {
        setLogo(null);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        console.log('Uploaded images:', files.map(file => file.name)); // Debug
        setImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.title ||  !formData.karat || !formData.weight || !formData.design_type) {

            alert('يرجى ملء جميع الحقول المطلوبة (اسم المنتج، السعر، العيار، الوزن، نوع التصميم)');
            return;
        }

        if (!userShop) {
            alert('لم يتم العثور على متجرك. يرجى إنشاء متجر أولاً.');
            return;
        }

        try {
            setIsLoading(true);
            const willGenerateAI = !formData.description || formData.description.trim() === '';
            setLoadingMessage(willGenerateAI ? 'جاري توليد الوصف بالذكاء الاصطناعي...' : 'جاري حفظ المنتج...');

            // تحقق من صحة القيم قبل الإرسال
            const validDesignTypes = [
                'rings', 'chains', 'bracelets', 'earrings', 'necklaces', 'pendants', 'sets', 'watches', 'other'
            ];
            if (!validDesignTypes.includes(formData.design_type)) {
                alert('نوع التصميم غير صحيح. اختر من القائمة فقط.');
                setIsLoading(false);
                return;
            }
            if (formData.category && !validDesignTypes.includes(formData.category)) {
                alert('الفئة غير صحيحة. اختر من القائمة فقط أو اتركها فارغة.');
                setIsLoading(false);
                return;
            }
            if (!["18", "21", "24"].includes(formData.karat)) {
                alert('العيار يجب أن يكون 18 أو 21 أو 24 فقط.');
                setIsLoading(false);
                return;
            }
            if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
                alert('يرجى إدخال سعر صحيح أكبر من صفر.');
                setIsLoading(false);
                return;
            }
            if (isNaN(formData.weight) || parseFloat(formData.weight) <= 0) {
                alert('يرجى إدخال وزن صحيح أكبر من صفر.');
                setIsLoading(false);
                return;
            }

            // Create FormData object for multipart/form-data
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            if (formData.description && formData.description.trim() !== '') {
                formDataToSend.append('description', formData.description);
            }
            // Ensure price and weight are numbers and not empty
            formDataToSend.append('price', formData.price ? parseFloat(formData.price) : 0);
            formDataToSend.append('karat', formData.karat);
            formDataToSend.append('weight', formData.weight ? parseFloat(formData.weight) : 0);
            formDataToSend.append('design_type', formData.design_type || 'other');
            // If category is empty, use design_type as fallback
            formDataToSend.append('category', formData.category || formData.design_type || 'other');
            formDataToSend.append('shop', userShop._id || userShop.id);

            // Append logo file
            if (logo) {
                formDataToSend.append('logo', logo);
            }

            // Append image files
            images.forEach((image) => {
                formDataToSend.append('images', image);
            });

            // Debug: Log FormData contents
            console.log('Creating product with FormData:');
            for (const [key, value] of formDataToSend.entries()) {
                console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
            }

            // Debug: Log state
            console.log('Form state:', {
                formData,
                logo: logo ? `File(${logo.name})` : null,
                images: images.map(image => `File(${image.name})`),
                shop: userShop._id || userShop.id
            });

            const response = await productService.createProduct(formDataToSend);
            console.log('Product created successfully:', response);

            const successMessage = formData.description
                ? 'تم إنشاء المنتج بنجاح!'
                : 'تم إنشاء المنتج بنجاح! تم توليد الوصف تلقائياً باستخدام الذكاء الاصطناعي.';
            alert(successMessage);
            navigate(ROUTES.DASHBOARD);
        } catch (error) {
            console.error('Error creating product:', error);
            const errorMessage = error.response?.data?.message || error.message;

            // Handle AI description generation error
            if (errorMessage.includes('Failed to generate AI description')) {
                const choice = window.confirm(
                    'فشل في توليد الوصف التلقائي\n\n' +
                    'الأسباب المحتملة:\n' +
                    '• مفتاح OpenAI API غير صحيح أو منتهي الصلاحية\n' +
                    '• نفاد الرصيد في حساب OpenAI\n' +
                    '• مشكلة في الاتصال بالإنترنت\n' +
                    '• خطأ مؤقت في خدمة OpenAI\n\n' +
                    'الحلول المتاحة:\n' +
                    'موافق = إضافة وصف يدوياً\n' +
                    'إلغاء = إنشاء المنتج بوصف افتراضي'
                );

                if (choice) {
                    const descriptionField = document.querySelector('textarea[name="description"]');
                    if (descriptionField) {
                        descriptionField.focus();
                        descriptionField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        descriptionField.style.borderColor = '#A37F41';
                        setTimeout(() => {
                            descriptionField.style.borderColor = '';
                        }, 3000);
                    }
                    alert('يرجى إضافة وصف للمنتج في الحقل المميز أعلاه ثم المحاولة مرة أخرى.');
                } else {
                    const categoryLabel = categories.find(cat => cat.value === formData.category)?.label || formData.category || 'منتج';
                    const defaultDescription = `${formData.title} - ${categoryLabel} من الذهب عيار ${formData.karat} بوزن ${formData.weight} جرام. منتج عالي الجودة بسعر ${formData.price} جنيه مصري.`;

                    const confirmDefault = window.confirm(
                        `سيتم إنشاء المنتج بالوصف التالي:\n\n"${defaultDescription}"\n\nهل تريد المتابعة؟`
                    );

                    if (confirmDefault) {
                        // إعادة تعريف formDataToSend هنا
                        const formDataToSend = new FormData();
                        formDataToSend.append('title', formData.title);
                        formDataToSend.append('description', defaultDescription);
                        formDataToSend.append('price', formData.price ? parseFloat(formData.price) : 0);
                        formDataToSend.append('karat', formData.karat);
                        formDataToSend.append('weight', formData.weight ? parseFloat(formData.weight) : 0);
                        formDataToSend.append('design_type', formData.design_type || 'other');
                        formDataToSend.append('category', formData.category || formData.design_type || 'other');
                        formDataToSend.append('shop', userShop._id || userShop.id);
                        if (logo) {
                            formDataToSend.append('logo', logo);
                        }
                        images.forEach((image) => {
                            formDataToSend.append('images', image);
                        });
                        try {
                            const response = await productService.createProduct(formDataToSend);
                            console.log('Product created with default description:', response);
                            alert('تم إنشاء المنتج بنجاح بوصف افتراضي!\n\nيمكنك تعديل الوصف لاحقاً من لوحة التحكم.');
                            navigate(ROUTES.DASHBOARD);
                            return;
                        } catch (retryError) {
                            console.error('Retry failed:', retryError);
                            alert(`فشل في إنشاء المنتج: ${retryError.response?.data?.message || retryError.message}`);
                        }
                    }
                }
            } else {
                alert(`حدث خطأ في إنشاء المنتج: ${errorMessage}`);
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

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
                    {/* Basic Information */}
                    <Card className="bg-white border-secondary-2">
                        <CardHeader>
                            <CardTitle className="text-primary-900 font-cairo">المعلومات الأساسية</CardTitle>
                            <CardDescription className="text-secondary-800 font-cairo">
                                أدخل المعلومات الأساسية للمنتج
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-primary-900 mb-2 font-cairo">
                                        اسم المنتج *
                                    </label>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="أدخل اسم المنتج"
                                        required
                                        className="font-cairo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-primary-900 mb-2 font-cairo">
                                        نوع التصميم *
                                    </label>
                                    <select
                                        name="design_type"
                                        value={formData.design_type}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="">اختر نوع التصميم</option>
                                        {categories.map((category) => (
                                            <option key={category.value} value={category.value}>
                                                {category.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الفئة
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="">اختر الفئة</option>
                                            {categories.map((category) => (
                                                <option key={category.value} value={category.value}>
                                                    {category.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div> */}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        السعر (ج.م) 
                                    </label>
                                    <Input
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        
                                    />
                                </div> */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        العيار *
                                    </label>
                                    <select
                                        name="karat"
                                        value={formData.karat}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="">اختر العيار</option>
                                        <option value="18">18 قيراط</option>
                                        <option value="21">21 قيراط</option>
                                        <option value="24">24 قيراط</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الوزن (جرام) *
                                    </label>
                                    <Input
                                        name="weight"
                                        type="number"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        placeholder="الوزن بالجرام"
                                        min="0"
                                        step="0.01"
                                        required
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
                                        className={`w-full p-3 border rounded-md resize-none h-32 ${formData.description.trim() === ''
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
                                        <strong>نصيحة:</strong> إذا تركت هذا الحقل فارغاً، سيتم توليد وصف تلقائي للمنتج باستخدام الذكاء الاصطناعي بناءً على اسم المنتج، الفئة، والسعر.
                                    </p>
                                    {formData.description.trim() === '' && (formData.title || formData.design_type ) && (
                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm font-medium text-blue-800 mb-2">
                                                معاينة البيانات للتوليد التلقائي:
                                            </p>
                                            <ul className="text-sm text-blue-700 space-y-1">
                                                {formData.title && (
                                                    <li>• <strong>اسم المنتج:</strong> {formData.title}</li>
                                                )}
                                                {formData.design_type && (
                                                    <li>• <strong>نوع التصميم:</strong> {categories.find(cat => cat.value === formData.design_type)?.label || formData.design_type}</li>
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

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>صور المنتج</CardTitle>
                            <CardDescription>
                                أضف شعار المنتج وصوراً إضافية (اختياري)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    شعار المنتج
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-4">اسحب شعار المنتج أو انقر للاختيار</p>
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
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { QrCode, Share2, Download, Eye, ArrowLeft, Loader2 } from 'lucide-react';
// import shopService from '../../services/shopService.js';
import { ROUTES } from '../../utils/constants.js';

const ShopQRCode = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [qrCodeLoading, setQrCodeLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShopData();
    }, []);

    useEffect(() => {
        if (shop && (shop._id || shop.id)) {
            loadQRCode(shop._id || shop.id);
        }
    }, [shop]);

    const loadShopData = async () => {
        try {
            setLoading(true);
            const response = await shopService.getShops();
            if (response.data && response.data.length > 0) {
                setShop(response.data[0]);
            }
        } catch (error) {
            console.error('Error loading shop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadQRCode = async (shopId) => {
        try {
            setQrCodeLoading(true);
            const response = await shopService.getQRCode(shopId);
            setQrCode(response.data);
        } catch (error) {
            console.error('Error loading QR code:', error);
            // If QR code doesn't exist, try to generate it
            try {
                const generateResponse = await shopService.generateQRCode(shopId);
                setQrCode(generateResponse.data);
            } catch (generateError) {
                console.error('Error generating QR code:', generateError);
            }
        } finally {
            setQrCodeLoading(false);
        }
    };

    const shareShopLink = async () => {
        if (!qrCode) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `متجر ${shop?.name}`,
                    text: `تفضل بزيارة متجر ${shop?.name} للذهب والمجوهرات`,
                    url: qrCode.qrCodeUrl
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(qrCode.qrCodeUrl);
                alert('✅ تم نسخ رابط المتجر إلى الحافظة بنجاح!\n\nيمكنك الآن مشاركته مع العملاء عبر أي تطبيق تريده.');
            }
        } catch (error) {
            console.error('Error sharing shop link:', error);
            alert('حدث خطأ في مشاركة رابط المتجر');
        }
    };

    const generateNewQRCode = async () => {
        if (!shop) return;

        try {
            setQrCodeLoading(true);
            const response = await shopService.generateQRCode(shop._id || shop.id);
            setQrCode(response.data);
            alert('تم توليد QR Code جديد بنجاح!');
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('حدث خطأ في توليد QR Code');
        } finally {
            setQrCodeLoading(false);
        }
    };

    const downloadQRCode = () => {
        if (!qrCode || !shop) return;

        try {
            const link = document.createElement('a');
            link.href = qrCode.qrCode;

            const cleanShopName = shop.name
                .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')
                .replace(/\s+/g, '-')
                .trim();

            link.download = `${cleanShopName}-QR-Code.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('حدث خطأ في تحميل QR Code');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
                    <p className="text-gray-600">جاري تحميل بيانات المتجر...</p>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">لا يوجد متجر</h2>
                    <p className="text-gray-600 mb-4">
                        لم يتم العثور على متجر مرتبط بحسابك. يرجى التأكد من:
                    </p>
                    <ul className="text-sm text-gray-600 text-right mb-6 space-y-1">
                        <li>• أن لديك متجر مسجل</li>
                        <li>• أن المتجر معتمد من الأدمن</li>
                        <li>• أن رسوم الاشتراك مدفوعة</li>
                        <li>• أنك مسجل دخول بالحساب الصحيح</li>
                    </ul>
                    <div className="space-y-3">
                        <Button onClick={() => navigate(ROUTES.DASHBOARD)} className="w-full">
                            العودة إلى لوحة التحكم
                        </Button>
                        <Button
                            onClick={() => navigate(ROUTES.CREATE_SHOP)}
                            variant="outline"
                            className="w-full"
                        >
                            إنشاء متجر جديد
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <Button
                                onClick={() => navigate(ROUTES.DASHBOARD)}
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 ml-2" />
                                العودة
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">QR Code المتجر</h1>
                                <p className="text-gray-600 mt-1">
                                    شارك رابط متجرك مع العملاء بسهولة
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <QrCode className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{shop.name}</h2>
                            <p className="text-gray-600">{shop.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                📍 {shop.address}
                            </p>
                        </div>
                    </div>
                </div>

                {/* QR Code Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-8">
                        {qrCodeLoading ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-yellow-600" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    جاري تحميل QR Code...
                                </h3>
                                <p className="text-gray-600">
                                    يرجى الانتظار بينما نقوم بتحميل QR Code الخاص بمتجرك
                                </p>
                            </div>
                        ) : qrCode ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* QR Code Display - أضيق */}
                                <div className="text-center">
                                    <div className="bg-white p-8 rounded-xl border-2 border-gray-100 shadow-sm inline-block">
                                        <img
                                            src={qrCode.qrCode}
                                            alt="QR Code"
                                            className="w-72 h-72 mx-auto mb-6 border border-gray-100 rounded-lg shadow-sm"
                                        />
                                        <p className="text-sm text-gray-600 mb-4 break-all">
                                            <strong>الرابط:</strong> {qrCode.qrCodeUrl}
                                        </p>
                                    </div>
                                </div>

                                {/* Instructions and Actions - أوسع */}
                                <div className="space-y-8">
                                    {/* Instructions */}
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                                        <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
                                            <Eye className="w-5 h-5 mr-2" />
                                            كيفية الاستخدام
                                        </h3>
                                        <div className="space-y-3 text-yellow-700">
                                            <div className="flex items-start space-x-3 space-x-reverse">
                                                <span className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                                                <p>اطبع QR Code ووضعه في مكان واضح في متجرك</p>
                                            </div>
                                            <div className="flex items-start space-x-3 space-x-reverse">
                                                <span className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                                                <p>العملاء يمكنهم مسح الكود باستخدام كاميرا الهاتف</p>
                                            </div>
                                            <div className="flex items-start space-x-3 space-x-reverse">
                                                <span className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                                                <p>سيتم توجيههم مباشرة إلى صفحة متجرك الإلكترونية</p>
                                            </div>
                                            <div className="flex items-start space-x-3 space-x-reverse">
                                                <span className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                                                <p>يمكنهم تصفح منتجاتك وحجز مواعيد بسهولة</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Button
                                                onClick={downloadQRCode}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                size="lg"
                                            >
                                                <Download className="w-5 h-5 mr-2" />
                                                تحميل QR Code
                                            </Button>

                                            <Button
                                                onClick={generateNewQRCode}
                                                variant="outline"
                                                size="lg"
                                                disabled={qrCodeLoading}
                                            >
                                                <QrCode className="w-5 h-5 mr-2" />
                                                إنشاء كود جديد
                                            </Button>
                                        </div>

                                        {/* زر مشاركة الرابط الوحيد */}
                                        <div className="flex justify-center">
                                            <Button
                                                onClick={shareShopLink}
                                                className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg"
                                                size="lg"
                                            >
                                                <Share2 className="w-5 h-5 mr-3" />
                                                📤 مشاركة رابط المتجر
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-12">
                                {/* قسم الإنشاء */}
                                <div className="text-center lg:text-right">
                                    <QrCode className="w-20 h-20 text-gray-400 mx-auto lg:mx-0 mb-6" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        رابط المتجر غير متاح حالياً
                                    </h3>
                                    <p className="text-gray-600 mb-8 text-lg">
                                        قم بإنشاء QR Code لمتجرك ليتمكن العملاء من الوصول إليه بسهولة عبر مسح الكود
                                    </p>
                                    <Button
                                        onClick={generateNewQRCode}
                                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-4 text-lg"
                                        size="lg"
                                        disabled={qrCodeLoading}
                                    >
                                        <QrCode className="w-6 h-6 mr-3" />
                                        🚀 إنشاء QR Code الآن
                                    </Button>
                                </div>

                                {/* قسم المعلومات */}
                                <div className="bg-gray-50 p-8 rounded-xl">
                                    <h4 className="text-xl font-semibold text-gray-900 mb-6">
                                        ✨ فوائد QR Code لمتجرك
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3 space-x-reverse">
                                            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                                <Eye className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-medium text-gray-900">سهولة الوصول</h5>
                                                <p className="text-gray-600 text-sm">العملاء يصلون لمتجرك بمسحة واحدة</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3 space-x-reverse">
                                            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                                                <Share2 className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-medium text-gray-900">مشاركة سريعة</h5>
                                                <p className="text-gray-600 text-sm">شارك رابط متجرك عبر أي تطبيق</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3 space-x-reverse">
                                            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                                                <QrCode className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-medium text-gray-900">تجربة حديثة</h5>
                                                <p className="text-gray-600 text-sm">اعطِ انطباعاً احترافياً لعملائك</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopQRCode;

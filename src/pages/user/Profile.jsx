import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Save,
    X,
    Camera,
    Shield,
    Star,
    Heart,
    ShoppingBag
} from 'lucide-react';
import { userService } from '../../services/userService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES, USER_TYPES } from '../../utils/constants.js';

const Profile = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        bio: ''
    });
    const [stats, setStats] = useState({
        favorites: 0,
        bookings: 0,
        reviews: 0
    });

    const typeLabels = useMemo(() => ({
        [USER_TYPES.CUSTOMER]: 'عميل',
        [USER_TYPES.SELLER]: 'صاحب متجر',
        [USER_TYPES.ADMIN]: 'مدير'
    }), []);

    const badgeVariants = useMemo(() => ({
        [USER_TYPES.CUSTOMER]: 'secondary',
        [USER_TYPES.SELLER]: 'default',
        [USER_TYPES.ADMIN]: 'destructive'
    }), []);

    useEffect(() => {
        if (!user) {
            navigate(ROUTES.LOGIN);
            return;
        }

        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            bio: user.bio || ''
        });

        loadUserStats();
    }, [user, navigate]);

    const loadUserStats = async () => {
        try {
            setStats({
                favorites: 12,
                bookings: 5,
                reviews: 8
            });
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const response = await userService.updateProfile(formData);
            updateUser(response.data || response);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            bio: user.bio || ''
        });
        setIsEditing(false);
    };

    const getUserTypeLabel = (type) => typeLabels[type] || 'غير محدد';
    const getUserTypeBadgeVariant = (type) => badgeVariants[type] || 'secondary';

    if (!user) {
        return (
            <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
                    <p className="text-[#666666] font-medium" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
                        جاري تحميل الملف الشخصي...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F8F8] pt-20" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 animate-fadeIn">
                    <h1 className="text-3xl font-bold mb-4" style={{ color: '#222222' }}>
                        الملف الشخصي
                    </h1>
                    <p className="text-[#666666] font-medium">
                        إدارة معلوماتك الشخصية وإعداداتك
                    </p>
                    <div className="w-20 h-0.5 bg-gradient-to-r from-[#E0C36F] to-[#D4AF37] rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="bg-[#F8F8F8] border-[#D4AF37]/30 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 animate-fadeIn">
                            <CardHeader className="bg-gradient-to-r from-[#E0C36F]/10 to-[#D4AF37]/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-[#222222] font-bold">المعلومات الشخصية</CardTitle>
                                        <CardDescription className="text-[#666666]">
                                            قم بتحديث معلوماتك الشخصية هنا
                                        </CardDescription>
                                    </div>
                                    {!isEditing ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
                                            className="border-[#1A237E] text-[#1A237E] hover:bg-[#1A237E]/10 hover:text-[#1A237E] rounded-lg transition-all duration-300 hover:scale-105"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            تعديل
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={handleSave}
                                                disabled={isLoading}
                                                className="bg-gradient-to-r from-[#E0C36F] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#E0C36F] text-white rounded-lg transition-all duration-300 hover:scale-105"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                حفظ
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancel}
                                                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-300 hover:scale-105"
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                إلغاء
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-gradient-to-br from-[#E0C36F] to-[#D4AF37] rounded-full flex items-center justify-center ring-2 ring-white/50">
                                            {user.profilePicture ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_BASE_URL}/profile-image/${user.profilePicture}`}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover rounded-full"
                                                    onError={(e) => (e.target.style.display = 'none', e.target.nextSibling.style.display = 'flex')}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full">
                                                    <span className="text-white text-3xl">💎</span>
                                                </div>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <Button
                                                size="sm"
                                                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-[#D4AF37] hover:bg-[#E0C36F] text-white"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold" style={{ color: '#222222' }}>
                                            {user.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge
                                                variant={getUserTypeBadgeVariant(user.role)}
                                                className={`${
                                                    user.role === USER_TYPES.ADMIN ? 'bg-red-600 hover:bg-red-700' :
                                                    user.role === USER_TYPES.SELLER ? 'bg-[#D4AF37] hover:bg-[#E0C36F]' :
                                                    'bg-[#1A237E] hover:bg-[#1A237E]/80'
                                                } text-white px-3 py-1 text-xs font-medium rounded-full transition-all duration-300`}
                                            >
                                                {getUserTypeLabel(user.role)}
                                            </Badge>
                                            {user.verified && (
                                                <Badge className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-all duration-300">
                                                    <Shield className="w-3 h-3" />
                                                    موثق
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Separator className="bg-[#D4AF37]/30" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#666666' }}>
                                            الاسم الكامل
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="أدخل اسمك الكامل"
                                                className="border-[#D4AF37]/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 rounded-lg"
                                            />
                                        ) : (
                                            <p className="text-[#222222]">{user.name || 'غير محدد'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#666666' }}>
                                            البريد الإلكتروني
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="أدخل بريدك الإلكتروني"
                                                className="border-[#D4AF37]/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 rounded-lg"
                                            />
                                        ) : (
                                            <p className="text-[#222222]">{user.email || 'غير محدد'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#666666' }}>
                                            رقم الهاتف
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="أدخل رقم هاتفك"
                                                className="border-[#D4AF37]/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 rounded-lg"
                                            />
                                        ) : (
                                            <p className="text-[#222222]">{user.phone || 'غير محدد'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#666666' }}>
                                            العنوان
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="أدخل عنوانك"
                                                className="border-[#D4AF37]/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30 rounded-lg"
                                            />
                                        ) : (
                                            <p className="text-[#222222]">{user.address || 'غير محدد'}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#666666' }}>
                                        نبذة شخصية
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="اكتب نبذة عن نفسك"
                                            className="w-full p-3 border border-[#D4AF37]/50 rounded-lg resize-none h-24 focus:border-[#D4AF37] focus:ring-[#D4AF37]/30"
                                            style={{ backgroundColor: '#F8F8F8', color: '#222222' }}
                                        />
                                    ) : (
                                        <p className="text-[#222222]">{user.bio || 'لم يتم إضافة نبذة شخصية'}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm" style={{ color: '#666666' }}>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                                        انضم في {new Date(user.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card className="bg-[#F8F8F8] border-[#D4AF37]/30 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 animate-fadeIn">
                            <CardHeader className="bg-gradient-to-r from-[#E0C36F]/10 to-[#D4AF37]/10">
                                <CardTitle className="text-[#222222] font-bold">إحصائياتي</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        <span className="text-sm" style={{ color: '#666666' }}>المفضلة</span>
                                    </div>
                                    <span className="font-semibold" style={{ color: '#222222' }}>{stats.favorites}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#1A237E]" />
                                        <span className="text-sm" style={{ color: '#666666' }}>المواعيد</span>
                                    </div>
                                    <span className="font-semibold" style={{ color: '#222222' }}>{stats.bookings}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-[#D4AF37]" />
                                        <span className="text-sm" style={{ color: '#666666' }}>التقييمات</span>
                                    </div>
                                    <span className="font-semibold" style={{ color: '#222222' }}>{stats.reviews}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#F8F8F8] border-[#D4AF37]/30 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 animate-fadeIn">
                            <CardHeader className="bg-gradient-to-r from-[#E0C36F]/10 to-[#D4AF37]/10">
                                <CardTitle className="text-[#222222] font-bold">إجراءات سريعة</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-[#D4AF37]/50 text-[#222222] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-lg transition-all duration-300 hover:scale-105"
                                    onClick={() => navigate(ROUTES.FAVORITES)}
                                >
                                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                                    عرض المفضلة
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-[#D4AF37]/50 text-[#222222] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-lg transition-all duration-300 hover:scale-105"
                                    onClick={() => navigate(ROUTES.MY_BOOKINGS)}
                                >
                                    <Calendar className="w-4 h-4 mr-2 text-[#1A237E]" />
                                    مواعيدي
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-[#D4AF37]/50 text-[#222222] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] rounded-lg transition-all duration-300 hover:scale-105"
                                    onClick={() => navigate(ROUTES.SETTINGS)}
                                >
                                    <Edit className="w-4 h-4 mr-2 text-[#D4AF37]" />
                                    الإعدادات
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <footer className="bg-[#1C1C1C] py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm" style={{ color: '#D4AF37' }}>
                        اكتشف أجود المجوهرات مع ديبلا
                    </p>
                    <p className="text-xs mt-2" style={{ color: '#666666' }}>
                        © 2025 ديبلا. جميع الحقوق محفوظة.
                    </p>
                </div>
            </footer>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-in-out;
                }
                button:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default Profile;
import React, { useState, useEffect } from 'react';
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
            // This would load user statistics from the backend
            // const response = await userService.getUserStats();
            // setStats(response.data);

            // Using mock data for demo
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

    const getUserTypeLabel = (type) => {
        const typeLabels = {
            [USER_TYPES.CUSTOMER]: 'عميل',
            [USER_TYPES.SELLER]: 'صاحب متجر',
            [USER_TYPES.ADMIN]: 'مدير'
        };
        return typeLabels[type] || 'غير محدد';
    };

    const getUserTypeBadgeVariant = (type) => {
        const variants = {
            [USER_TYPES.CUSTOMER]: 'secondary',
            [USER_TYPES.SELLER]: 'default',
            [USER_TYPES.ADMIN]: 'destructive'
        };
        return variants[type] || 'secondary';
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الملف الشخصي...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">الملف الشخصي</h1>
                    <p className="text-gray-600">إدارة معلوماتك الشخصية وإعداداتك</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>المعلومات الشخصية</CardTitle>
                                        <CardDescription>
                                            قم بتحديث معلوماتك الشخصية هنا
                                        </CardDescription>
                                    </div>
                                    {!isEditing ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(true)}
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
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                حفظ
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancel}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                إلغاء
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Profile Picture */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <User className="w-12 h-12 text-yellow-600" />
                                        </div>
                                        {isEditing && (
                                            <Button
                                                size="sm"
                                                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                                            >
                                                <Camera className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{user.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={getUserTypeBadgeVariant(user.role)}>
                                                {getUserTypeLabel(user.role)}
                                            </Badge>
                                            {user.verified && (
                                                <Badge variant="success" className="flex items-center gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    موثق
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الاسم الكامل
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="أدخل اسمك الكامل"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user.name || 'غير محدد'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            البريد الإلكتروني
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="أدخل بريدك الإلكتروني"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user.email || 'غير محدد'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            رقم الهاتف
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="أدخل رقم هاتفك"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user.phone || 'غير محدد'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            العنوان
                                        </label>
                                        {isEditing ? (
                                            <Input
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="أدخل عنوانك"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{user.address || 'غير محدد'}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نبذة شخصية
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            placeholder="اكتب نبذة عن نفسك"
                                            className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                                        />
                                    ) : (
                                        <p className="text-gray-900">{user.bio || 'لم يتم إضافة نبذة شخصية'}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        انضم في {new Date(user.createdAt || Date.now()).toLocaleDateString('ar-EG')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>إحصائياتي</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        <span className="text-sm">المفضلة</span>
                                    </div>
                                    <span className="font-semibold">{stats.favorites}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm">المواعيد</span>
                                    </div>
                                    <span className="font-semibold">{stats.bookings}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm">التقييمات</span>
                                    </div>
                                    <span className="font-semibold">{stats.reviews}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>إجراءات سريعة</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate(ROUTES.FAVORITES)}
                                >
                                    <Heart className="w-4 h-4 mr-2" />
                                    عرض المفضلة
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate(ROUTES.MY_BOOKINGS)}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    مواعيدي
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate(ROUTES.SETTINGS)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    الإعدادات
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
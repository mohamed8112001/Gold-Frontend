import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Switch } from '@/components/ui/switch.jsx';
import { Separator } from '@/components/ui/separator.jsx';
import {
    Lock,
    Bell,
    Shield,
    Trash2,
    Eye,
    EyeOff,
    Save,
    AlertTriangle,
    Moon,
    Sun,
    Globe,
    Mail
} from 'lucide-react';
import { userService } from '../../services/userService.js';
import { authService } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const Settings = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        bookings: true,
        promotions: false
    });

    const [preferences, setPreferences] = useState({
        darkMode: false,
        language: 'ar',
        emailUpdates: true
    });

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (key, value) => {
        setNotifications(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('كلمات المرور الجديدة غير متطابقة');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        try {
            setIsLoading(true);
            await userService.resetPassword(passwordData.currentPassword, passwordData.newPassword);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            alert('تم تغيير كلمة المرور بنجاح');
        } catch (error) {
            console.error('Error changing password:', error);
            alert('حدث خطأ في تغيير كلمة المرور');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.'
        );

        if (confirmed) {
            const doubleConfirmed = window.confirm(
                'تأكيد أخير: سيتم حذف جميع بياناتك نهائياً. هل تريد المتابعة؟'
            );

            if (doubleConfirmed) {
                try {
                    setIsLoading(true);
                    await userService.deleteAccount();
                    logout();
                    navigate(ROUTES.HOME);
                } catch (error) {
                    console.error('Error deleting account:', error);
                    alert('حدث خطأ في حذف الحساب');
                } finally {
                    setIsLoading(false);
                }
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل الإعدادات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">الإعدادات</h1>
                    <p className="text-gray-600">إدارة إعدادات حسابك وتفضيلاتك</p>
                </div>

                <div className="space-y-8">
                    {/* Password Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                تغيير كلمة المرور
                            </CardTitle>
                            <CardDescription>
                                قم بتحديث كلمة المرور الخاصة بك لحماية حسابك
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        كلمة المرور الحالية
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="أدخل كلمة المرور الحالية"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        كلمة المرور الجديدة
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="أدخل كلمة المرور الجديدة"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        تأكيد كلمة المرور الجديدة
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="أعد إدخال كلمة المرور الجديدة"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <Button type="submit" disabled={isLoading}>
                                    <Save className="w-4 h-4 mr-2" />
                                    تحديث كلمة المرور
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                إعدادات الإشعارات
                            </CardTitle>
                            <CardDescription>
                                اختر الإشعارات التي تريد تلقيها
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">إشعارات البريد الإلكتروني</h4>
                                    <p className="text-sm text-gray-600">تلقي الإشعارات عبر البريد الإلكتروني</p>
                                </div>
                                <Switch
                                    checked={notifications.email}
                                    onCheckedChange={(value) => handleNotificationChange('email', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">الإشعارات الفورية</h4>
                                    <p className="text-sm text-gray-600">تلقي الإشعارات الفورية في المتصفح</p>
                                </div>
                                <Switch
                                    checked={notifications.push}
                                    onCheckedChange={(value) => handleNotificationChange('push', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">إشعارات المواعيد</h4>
                                    <p className="text-sm text-gray-600">تذكيرات بالمواعيد المحجوزة</p>
                                </div>
                                <Switch
                                    checked={notifications.bookings}
                                    onCheckedChange={(value) => handleNotificationChange('bookings', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">العروض والخصومات</h4>
                                    <p className="text-sm text-gray-600">تلقي إشعارات العروض الخاصة</p>
                                </div>
                                <Switch
                                    checked={notifications.promotions}
                                    onCheckedChange={(value) => handleNotificationChange('promotions', value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                التفضيلات العامة
                            </CardTitle>
                            <CardDescription>
                                إعدادات المظهر واللغة
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">الوضع الليلي</h4>
                                    <p className="text-sm text-gray-600">تفعيل المظهر الداكن</p>
                                </div>
                                <Switch
                                    checked={preferences.darkMode}
                                    onCheckedChange={(value) => handlePreferenceChange('darkMode', value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium">تحديثات البريد الإلكتروني</h4>
                                    <p className="text-sm text-gray-600">تلقي النشرة الإخبارية والتحديثات</p>
                                </div>
                                <Switch
                                    checked={preferences.emailUpdates}
                                    onCheckedChange={(value) => handlePreferenceChange('emailUpdates', value)}
                                />
                            </div>

                            {/* تم حذف خيار اللغة نهائيًا */}
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-5 h-5" />
                                المنطقة الخطرة
                            </CardTitle>
                            <CardDescription>
                                إجراءات لا يمكن التراجع عنها
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-medium text-red-800 mb-2">حذف الحساب</h4>
                                <p className="text-sm text-red-700 mb-4">
                                    سيتم حذف حسابك وجميع بياناتك نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    حذف الحساب نهائياً
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;
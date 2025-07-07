import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const MyBookings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        if (!user) {
            navigate(ROUTES.LOGIN);
            return;
        }
        loadBookings();
    }, [user, navigate]);

    const loadBookings = async () => {
        try {
            setIsLoading(true);
            // This would need to be implemented in the backend
            // const response = await bookingService.getUserBookings(user.id);
            // setBookings(response.data || response);

            // Using mock data for demo
            setBookings(mockBookings);
        } catch (error) {
            console.error('Error loading bookings:', error);
            setBookings(mockBookings);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        const confirmed = window.confirm('هل أنت متأكد من إلغاء هذا الموعد؟');

        if (confirmed) {
            try {
                // This would need to be implemented in the backend
                // await bookingService.cancelBooking(bookingId);

                setBookings(prev => prev.map(booking =>
                    booking.id === bookingId
                        ? { ...booking, status: 'cancelled' }
                        : booking
                ));
            } catch (error) {
                console.error('Error cancelling booking:', error);
            }
        }
    };

    // Mock data for demo
    const mockBookings = [
        {
            id: 1,
            shopName: 'مجوهرات الإسكندرية',
            shopAddress: 'شارع فؤاد، الإسكندرية',
            shopPhone: '+20 3 123 4567',
            date: '2024-01-25',
            time: '14:00',
            status: 'confirmed',
            notes: 'أريد رؤية خواتم الخطوبة',
            createdAt: '2024-01-20',
            shopId: 1
        },
        {
            id: 2,
            shopName: 'رويال جولد',
            shopAddress: 'شارع التحرير، القاهرة',
            shopPhone: '+20 2 234 5678',
            date: '2024-01-22',
            time: '16:30',
            status: 'pending',
            notes: 'مهتم بالسلاسل الذهبية',
            createdAt: '2024-01-21',
            shopId: 2
        },
        {
            id: 3,
            shopName: 'الماس الشرق',
            shopAddress: 'شارع الجمهورية، الإسكندرية',
            shopPhone: '+20 3 345 6789',
            date: '2024-01-18',
            time: '11:00',
            status: 'completed',
            notes: 'شراء أسورة ذهبية',
            createdAt: '2024-01-15',
            shopId: 3
        },
        {
            id: 4,
            shopName: 'مجوهرات الإسكندرية',
            shopAddress: 'شارع فؤاد، الإسكندرية',
            shopPhone: '+20 3 123 4567',
            date: '2024-01-16',
            time: '13:00',
            status: 'cancelled',
            notes: 'تم الإلغاء بسبب ظروف طارئة',
            createdAt: '2024-01-14',
            shopId: 1
        }
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'في الانتظار', variant: 'secondary', icon: AlertCircle },
            confirmed: { label: 'مؤكد', variant: 'default', icon: CheckCircle },
            completed: { label: 'مكتمل', variant: 'success', icon: CheckCircle },
            cancelled: { label: 'ملغي', variant: 'destructive', icon: XCircle }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    const filterBookings = (status) => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        switch (status) {
            case 'upcoming':
                return bookings.filter(booking =>
                    (booking.status === 'confirmed' || booking.status === 'pending') &&
                    booking.date >= today
                );
            case 'past':
                return bookings.filter(booking =>
                    booking.status === 'completed' ||
                    (booking.date < today && booking.status !== 'cancelled')
                );
            case 'cancelled':
                return bookings.filter(booking => booking.status === 'cancelled');
            default:
                return bookings;
        }
    };

    const BookingCard = ({ booking }) => {
        const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending';
        const canCancel = isUpcoming && new Date(booking.date) > new Date();

        return (
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-lg">{booking.shopName}</CardTitle>
                            <CardDescription>
                                {new Date(booking.date).toLocaleDateString('ar-EG')} في {booking.time}
                            </CardDescription>
                        </div>
                        {getStatusBadge(booking.status)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{booking.shopAddress}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{booking.shopPhone}</span>
                        </div>
                    </div>

                    {booking.notes && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">ملاحظات:</p>
                            <p className="text-sm text-gray-600">{booking.notes}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        تم الحجز في {new Date(booking.createdAt).toLocaleDateString('ar-EG')}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(ROUTES.SHOP_DETAILS(booking.shopId))}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            عرض المتجر
                        </Button>

                        {canCancel && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <XCircle className="w-4 h-4 mr-1" />
                                إلغاء الموعد
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل مواعيدك...</p>
                </div>
            </div>
        );
    }

    const upcomingBookings = filterBookings('upcoming');
    const pastBookings = filterBookings('past');
    const cancelledBookings = filterBookings('cancelled');

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">مواعيدي</h1>
                        <Button onClick={() => navigate(ROUTES.SHOPS)}>
                            <Plus className="w-4 h-4 mr-2" />
                            حجز موعد جديد
                        </Button>
                    </div>
                    <p className="text-gray-600">إدارة جميع مواعيدك المحجوزة</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upcoming">
                            القادمة ({upcomingBookings.length})
                        </TabsTrigger>
                        <TabsTrigger value="past">
                            السابقة ({pastBookings.length})
                        </TabsTrigger>
                        <TabsTrigger value="cancelled">
                            الملغية ({cancelledBookings.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-6">
                        {upcomingBookings.length > 0 ? (
                            <div className="grid gap-6">
                                {upcomingBookings.map((booking) => (
                                    <BookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد مواعيد قادمة
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    احجز موعداً جديداً لزيارة أحد المتاجر
                                </p>
                                <Button onClick={() => navigate(ROUTES.SHOPS)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    حجز موعد جديد
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-6">
                        {pastBookings.length > 0 ? (
                            <div className="grid gap-6">
                                {pastBookings.map((booking) => (
                                    <BookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد مواعيد سابقة
                                </h3>
                                <p className="text-gray-600">
                                    ستظهر هنا المواعيد التي تمت زيارتها
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="cancelled" className="space-y-6">
                        {cancelledBookings.length > 0 ? (
                            <div className="grid gap-6">
                                {cancelledBookings.map((booking) => (
                                    <BookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    لا توجد مواعيد ملغية
                                </h3>
                                <p className="text-gray-600">
                                    ستظهر هنا المواعيد التي تم إلغاؤها
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default MyBookings;
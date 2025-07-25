import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { reservationService } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

const MyReservations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadReservations();
  }, [user, navigate]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reservationService.getUserReservations();
      setReservations(response.data?.reservations || []);
    } catch (err) {
      setError(err.message || 'فشل في تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    const confirmed = window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟');
    if (!confirmed) return;

    try {
      setCancellingId(reservationId);
      await reservationService.cancelReservation(reservationId, 'إلغاء من قبل المستخدم');
      await loadReservations(); // إعادة تحميل القائمة
    } catch (err) {
      alert('فشل في إلغاء الحجز: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirmReservation = async (reservationId) => {
    try {
      // التوجه إلى صفحة دفع المبلغ المتبقي
      navigate(`/reservation/${reservationId}/confirm`);
    } catch (err) {
      alert('خطأ: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'في الانتظار', icon: Clock },
      'active': { color: 'bg-blue-100 text-blue-800', text: 'نشط', icon: CheckCircle },
      'confirmed': { color: 'bg-green-100 text-green-800', text: 'مؤكد', icon: CheckCircle },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'ملغي', icon: XCircle },
      'expired': { color: 'bg-gray-100 text-gray-800', text: 'منتهي الصلاحية', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">جاري تحميل حجوزاتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">حجوزاتي</h1>
          <p className="text-gray-600">إدارة جميع حجوزات المنتجات الخاصة بك</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-700 text-center">{error}</p>
            <Button 
              onClick={loadReservations} 
              className="mt-2 mx-auto block"
              variant="outline"
            >
              إعادة المحاولة
            </Button>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">لا توجد حجوزات</h2>
            <p className="text-gray-600 mb-6">لم تقم بحجز أي منتجات بعد</p>
            <Button 
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              تصفح المنتجات
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {reservation.productId?.logoUrl && (
                      <img 
                        src={reservation.productId.logoUrl} 
                        alt={reservation.productId.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {reservation.productId?.name || 'منتج غير متوفر'}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {reservation.shopId?.name || 'متجر غير متوفر'}
                      </p>
                      <div className="mt-2">
                        {getStatusBadge(reservation.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-sm text-gray-500">تاريخ الحجز</p>
                    <p className="font-semibold">{formatDate(reservation.reservationDate)}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">إجمالي السعر</p>
                    <p className="font-bold text-lg">{formatPrice(reservation.totalAmount)} جنيه</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">المبلغ المدفوع</p>
                    <p className="font-bold text-lg text-green-600">{formatPrice(reservation.reservationAmount)} جنيه</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">المبلغ المتبقي</p>
                    <p className="font-bold text-lg text-blue-600">{formatPrice(reservation.remainingAmount)} جنيه</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">تاريخ الانتهاء</p>
                    <p className="font-bold text-lg text-red-600">{formatDate(reservation.expiryDate)}</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  {reservation.status === 'active' && (
                    <>
                      <Button
                        onClick={() => handleConfirmReservation(reservation.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        دفع المبلغ المتبقي
                      </Button>
                      <Button
                        onClick={() => handleCancelReservation(reservation.id)}
                        disabled={cancellingId === reservation.id}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {cancellingId === reservation.id ? 'جاري الإلغاء...' : 'إلغاء الحجز'}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={() => navigate(`/reservation/${reservation.id}`)}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    عرض التفاصيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;

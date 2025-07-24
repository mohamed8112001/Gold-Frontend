import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { shopService } from '../../services/shopService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, XCircle, Clock, Eye, User, Phone, Mail, MapPin } from 'lucide-react';

const ShopActivationManagement = () => {
  const { user, isAdmin } = useAuth();
  const [pendingShops, setPendingShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }
    fetchPendingShops();
  }, [user, isAdmin]);

  const fetchPendingShops = async () => {
    try {
      setIsLoading(true);
      const response = await shopService.getPendingActivations();
      setPendingShops(response.data || []);
    } catch (err) {
      setError('فشل في تحميل طلبات التفعيل');
      console.error('Error fetching pending shops:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (shopId) => {
    try {
      const response = await shopService.approveShopActivation(shopId);
      await fetchPendingShops(); // Refresh the list

      // عرض رسالة نجاح مع تفاصيل إضافية
      alert(
        '✅ تم الموافقة على طلب التفعيل بنجاح!\n\n' +
        '📧 تم إرسال إشعار فوري لصاحب المتجر\n' +
        '💳 يمكن لصاحب المتجر الآن المتابعة لعملية الدفع'
      );

      console.log('Shop approved successfully:', response);
    } catch (err) {
      console.error('Error approving shop:', err);
      alert('فشل في الموافقة على الطلب: ' + (err.message || 'حاول مرة أخرى'));
    }
  };

  const handleReject = async () => {
    if (!selectedShop || !rejectionReason.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    try {
      const response = await shopService.rejectShopActivation(selectedShop._id, rejectionReason);
      await fetchPendingShops(); // Refresh the list
      setShowRejectModal(false);
      setSelectedShop(null);
      setRejectionReason('');

      // عرض رسالة نجاح مع تفاصيل إضافية
      alert(
        '❌ تم رفض طلب التفعيل\n\n' +
        '📧 تم إرسال إشعار فوري لصاحب المتجر مع سبب الرفض\n' +
        '🔄 يمكن لصاحب المتجر إعادة التقديم بعد معالجة المشاكل'
      );

      console.log('Shop rejected successfully:', response);
    } catch (err) {
      console.error('Error rejecting shop:', err);
      alert('فشل في رفض الطلب: ' + (err.message || 'حاول مرة أخرى'));
    }
  };

  const openRejectModal = (shop) => {
    setSelectedShop(shop);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedShop(null);
    setRejectionReason('');
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">غير مصرح</h2>
            <p className="text-gray-600">هذه الصفحة مخصصة للمديرين فقط</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A37F41]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة طلبات تفعيل المتاجر</h1>
          <p className="text-gray-600">مراجعة والموافقة على طلبات تفعيل المتاجر</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                طلبات التفعيل المعلقة
              </CardTitle>
              <CardDescription>
                {pendingShops.length} طلب في انتظار المراجعة
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {pendingShops.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات معلقة</h3>
              <p className="text-gray-600">جميع طلبات التفعيل تم مراجعتها</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingShops.map((shop) => (
              <Card key={shop._id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${shop.logoUrl}`}
                        alt={shop.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <CardTitle className="text-xl">{shop.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {shop.description}
                        </CardDescription>
                        <Badge variant="outline" className="mt-2">
                          <Clock className="w-3 h-3 mr-1" />
                          في انتظار المراجعة
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Shop Information */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">معلومات المتجر</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{shop.city} - {shop.area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{shop.phone}</span>
                        </div>
                        {shop.whatsapp && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-500" />
                            <span>واتساب: {shop.whatsapp}</span>
                          </div>
                        )}
                        <div className="mt-3">
                          <span className="font-medium">التخصصات: </span>
                          <span>{shop.specialties?.join(', ') || 'غير محدد'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Owner Information */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">معلومات صاحب المتجر</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{shop.owner?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{shop.owner?.email}</span>
                        </div>
                        {shop.owner?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{shop.owner.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-6 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(shop._id)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      الموافقة على التفعيل
                    </Button>
                    <Button
                      onClick={() => openRejectModal(shop)}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      رفض الطلب
                    </Button>
                    {shop.commercialRecord && (
                      <Button
                        onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/uploads/${shop.commercialRecord}`, '_blank')}
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        عرض السجل التجاري
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">رفض طلب التفعيل</h3>
              <p className="text-gray-600 mb-4">
                يرجى إدخال سبب رفض طلب تفعيل متجر "{selectedShop?.name}"
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="اكتب سبب الرفض..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-4"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  disabled={!rejectionReason.trim()}
                >
                  تأكيد الرفض
                </Button>
                <Button
                  onClick={closeRejectModal}
                  variant="outline"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopActivationManagement;

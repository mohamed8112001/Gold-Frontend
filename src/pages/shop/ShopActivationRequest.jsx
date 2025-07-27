import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { shopService } from '../../services/shopService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle, Clock, XCircle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useShopNotifications } from '../../hooks/useShopNotifications';

const ShopActivationRequest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isShopOwner } = useAuth();
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !isShopOwner) {
      navigate('/login');
      return;
    }
    fetchShopData();
  }, [user, isShopOwner, navigate, id]);

  // Auto-refresh shop data every 15 seconds to catch status updates
  useEffect(() => {
    if (!shop) return;

    const interval = setInterval(() => {
      fetchShopData();
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [shop]);

  // استخدام hook الإشعارات
  useShopNotifications(
    // عند الموافقة
    () => {
      console.log('Shop approved, refreshing data...');
      fetchShopData();
    },
    // عند الرفض
    () => {
      console.log('Shop rejected, refreshing data...');
      fetchShopData();
    }
  );

  const fetchShopData = async () => {
    try {
      setIsLoading(true);
      const response = await shopService.getShop(id);
      setShop(response.data);
    } catch (err) {
      setError('فشل في تحميل بيانات المتجر');
      console.error('Error fetching shop:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestActivation = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      await shopService.requestShopActivation(shop._id);
      
      // Refresh shop data to get updated status
      await fetchShopData();
      
      alert('تم إرسال طلب التفعيل بنجاح! سيتم مراجعته من قبل الإدارة.');
    } catch (err) {
      setError(err.message || 'فشل في إرسال طلب التفعيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'في انتظار المراجعة';
      case 'approved':
        return 'تم الموافقة';
      case 'rejected':
        return 'تم الرفض';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A37F41]"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">متجر غير موجود</h2>
            <p className="text-gray-600 mb-4">لم يتم العثور على المتجر المطلوب</p>
            <Button onClick={() => navigate('/dashboard')}>
              العودة إلى لوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">طلب تفعيل المتجر</h1>
              <p className="text-gray-600">إدارة حالة تفعيل متجرك</p>
            </div>
            <Button
              onClick={fetchShopData}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث الحالة
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Shop Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {shop.name}
              </CardTitle>
              <CardDescription>
                {shop.description}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Activation Status */}
          <Card>
            <CardHeader>
              <CardTitle>حالة طلب التفعيل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor(shop.requestStatus)}`}>
                {getStatusIcon(shop.requestStatus)}
                <div className="flex-1">
                  <h3 className="font-semibold">{getStatusText(shop.requestStatus)}</h3>
                  {shop.requestStatus === 'pending' && (
                    <p className="text-sm mt-1">
                      تم إرسال طلب التفعيل وهو قيد المراجعة من قبل الإدارة
                    </p>
                  )}
                  {shop.requestStatus === 'approved' && (
                    <p className="text-sm mt-1">
                      تم الموافقة على متجرك! يمكنك الآن المتابعة لعملية الدفع لتفعيل الحساب
                    </p>
                  )}
                  {shop.requestStatus === 'rejected' && (
                    <div className="text-sm mt-1">
                      <p>تم رفض طلب التفعيل</p>
                      {shop.rejectionReason && (
                        <p className="mt-1 font-medium">السبب: {shop.rejectionReason}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {shop.requestStatus === 'pending' && (
                  <div className="text-center w-full">
                    <p className="text-gray-600 mb-4">
                      طلب التفعيل قيد المراجعة. سيتم إشعارك عند اتخاذ قرار.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/dashboard')}
                    >
                      العودة إلى لوحة التحكم
                    </Button>
                  </div>
                )}

                {shop.requestStatus === 'approved' && !user?.paid && (
                  <div className="text-center w-full">
                    <p className="text-green-600 mb-4 font-medium">
                      🎉 تهانينا! تم الموافقة على متجرك
                    </p>
                    <p className="text-gray-600 mb-6">
                      يمكنك الآن المتابعة لعملية الدفع لتفعيل حسابك كصاحب متجر
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={() => navigate('/owner-payment')}
                        className="bg-[#A37F41] hover:bg-[#8B6A35]"
                      >
                        المتابعة للدفع
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/dashboard')}
                      >
                        العودة إلى لوحة التحكم
                      </Button>
                    </div>
                  </div>
                )}

                {shop.requestStatus === 'approved' && user?.paid && (
                  <div className="text-center w-full">
                    <p className="text-green-600 mb-4 font-medium">
                      ✅ متجرك نشط ومفعل بالكامل!
                    </p>
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="bg-[#A37F41] hover:bg-[#8B6A35]"
                    >
                      إدارة المتجر
                    </Button>
                  </div>
                )}

                {shop.requestStatus === 'rejected' && (
                  <div className="text-center w-full">
                    <p className="text-red-600 mb-4">
                      تم رفض طلب التفعيل. يمكنك تعديل المتجر وإعادة تقديم الطلب.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        onClick={handleRequestActivation}
                        disabled={isSubmitting}
                        className="bg-[#A37F41] hover:bg-[#8B6A35]"
                      >
                        {isSubmitting ? 'جاري الإرسال...' : 'إعادة تقديم الطلب'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(`/shop/edit/${shop._id}`)}
                      >
                        تعديل المتجر
                      </Button>
                    </div>
                  </div>
                )}

                {!shop.requestStatus || shop.requestStatus === '' && (
                  <div className="text-center w-full">
                    <p className="text-gray-600 mb-4">
                      لم يتم تقديم طلب تفعيل بعد. اضغط على الزر أدناه لتقديم الطلب.
                    </p>
                    <Button 
                      onClick={handleRequestActivation}
                      disabled={isSubmitting}
                      className="bg-[#A37F41] hover:bg-[#8B6A35]"
                    >
                      {isSubmitting ? 'جاري الإرسال...' : 'طلب تفعيل المتجر'}
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShopActivationRequest;

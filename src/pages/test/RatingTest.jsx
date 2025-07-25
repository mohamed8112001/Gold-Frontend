import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import ProductRating from '../../components/rating/ProductRating';
import StarRating, { RatingDisplay, InteractiveRating } from '../../components/rating/StarRating';
import { ratingService } from '../../services/ratingService';

const RatingTest = () => {
  const [testRating, setTestRating] = useState(0);
  const [testProductId, setTestProductId] = useState('');
  const [result, setResult] = useState(null);

  const handleTestRating = async () => {
    if (!testProductId || !testRating) {
      alert('يرجى إدخال معرف المنتج والتقييم');
      return;
    }

    try {
      const response = await ratingService.rateProduct(testProductId, {
        rating: testRating,
        comment: 'تقييم تجريبي من صفحة الاختبار'
      });
      setResult(response);
      alert('تم إرسال التقييم بنجاح!');
    } catch (error) {
      alert('خطأ في إرسال التقييم: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E6] via-white to-[#FFF8E6] p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-[#8A5700] mb-8 text-center">
          🌟 اختبار نظام التقييم
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Star Rating Components Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#8A5700]">مكونات النجوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Star Rating */}
              <div>
                <h3 className="font-bold mb-2">تقييم أساسي (4.5/5)</h3>
                <StarRating rating={4.5} />
              </div>

              {/* Rating Display */}
              <div>
                <h3 className="font-bold mb-2">عرض التقييم مع القيمة</h3>
                <RatingDisplay rating={3.7} showValue={true} />
              </div>

              {/* Interactive Rating */}
              <div>
                <h3 className="font-bold mb-2">تقييم تفاعلي</h3>
                <InteractiveRating
                  value={testRating}
                  onChange={setTestRating}
                  label="اختر تقييمك"
                  required={true}
                />
              </div>

              {/* Different Sizes */}
              <div>
                <h3 className="font-bold mb-2">أحجام مختلفة</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm">صغير:</span>
                    <StarRating rating={4} size="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">متوسط:</span>
                    <StarRating rating={4} size="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">كبير:</span>
                    <StarRating rating={4} size="w-8 h-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#8A5700]">اختبار الـ API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  معرف المنتج
                </label>
                <input
                  type="text"
                  value={testProductId}
                  onChange={(e) => setTestProductId(e.target.value)}
                  placeholder="أدخل معرف المنتج"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C37C00]"
                />
              </div>

              <InteractiveRating
                value={testRating}
                onChange={setTestRating}
                label="التقييم"
                required={true}
              />

              <Button
                onClick={handleTestRating}
                disabled={!testProductId || !testRating}
                className="w-full bg-[#C37C00] hover:bg-[#A66A00] text-white"
              >
                إرسال التقييم التجريبي
              </Button>

              {result && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-2">نتيجة الاختبار:</h4>
                  <pre className="text-sm text-green-700 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Full Product Rating Component Test */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-[#8A5700]">مكون التقييم الكامل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                معرف المنتج للاختبار
              </label>
              <input
                type="text"
                value={testProductId}
                onChange={(e) => setTestProductId(e.target.value)}
                placeholder="أدخل معرف المنتج"
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C37C00]"
              />
            </div>

            {testProductId && (
              <ProductRating productId={testProductId} showForm={true} />
            )}

            {!testProductId && (
              <div className="text-center py-8 text-gray-500">
                <p>أدخل معرف المنتج لعرض نظام التقييم</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-[#8A5700]">أمثلة الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-bold mb-2">1. عرض تقييم بسيط:</h4>
                <code className="bg-gray-100 p-2 rounded block">
                  {`<StarRating rating={4.5} />`}
                </code>
              </div>

              <div>
                <h4 className="font-bold mb-2">2. عرض تقييم مع القيمة:</h4>
                <code className="bg-gray-100 p-2 rounded block">
                  {`<RatingDisplay rating={3.7} showValue={true} />`}
                </code>
              </div>

              <div>
                <h4 className="font-bold mb-2">3. تقييم تفاعلي:</h4>
                <code className="bg-gray-100 p-2 rounded block">
                  {`<InteractiveRating 
  value={rating} 
  onChange={setRating} 
  label="اختر تقييمك" 
/>`}
                </code>
              </div>

              <div>
                <h4 className="font-bold mb-2">4. نظام التقييم الكامل:</h4>
                <code className="bg-gray-100 p-2 rounded block">
                  {`<ProductRating productId="123" showForm={true} />`}
                </code>
              </div>

              <div>
                <h4 className="font-bold mb-2">5. استخدام الـ API:</h4>
                <code className="bg-gray-100 p-2 rounded block">
                  {`// تقييم منتج
await ratingService.rateProduct(productId, {
  rating: 5,
  comment: "منتج ممتاز!"
});

// جلب تقييمات المنتج
const ratings = await ratingService.getProductRatings(productId);`}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RatingTest;

import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProductRating from '../rating/ProductRating';
import {
  Award,
  User,
  Verified,
  Star,
  ThumbsUp,
  ThumbsDown,
  Truck,
  RefreshCw,
  Shield
} from 'lucide-react';

const ProductDetailsTabs = ({ product, reviews, productId }) => {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <Card className="border-0 rounded-2xl">
      <CardHeader className="pb-0 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 h-auto">
            <TabsTrigger value="description" className="text-sm py-2">الوصف</TabsTrigger>
            <TabsTrigger value="specifications" className="text-sm py-2">المواصفات</TabsTrigger>
            <TabsTrigger value="reviews" className="text-sm py-2">التقييمات</TabsTrigger>
            <TabsTrigger value="shipping" className="text-sm py-2">الشحن</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4 px-4 pb-4">
            <div>
              <h3 className="text-lg font-bold mb-3">وصف المنتج</h3>
              <p className="text-gray-700 leading-relaxed mb-4 text-sm">
                {product.description}
              </p>

              {product.features && product.features.length > 0 && (
                <>
                  <h4 className="text-base font-semibold mb-3">الميزات الرئيسية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-4 px-4 pb-4">
            <div>
              <h3 className="text-lg font-bold mb-3">المواصفات التقنية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm">{key}</span>
                    <span className="text-gray-900 font-medium text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 px-4 pb-4">
            <div>
              <h3 className="text-lg font-bold mb-4">تقييمات العملاء</h3>
              {/* استخدام مكون ProductRating الكامل */}
              <ProductRating
                productId={productId}
                showForm={true}
                className="bg-transparent border-0 shadow-none p-0"
              />
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4 px-4 pb-4">
            <div>
              <h3 className="text-lg font-bold mb-3">الشحن والإرجاع</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800 text-sm">شحن مجاني</span>
                  </div>
                  <p className="text-green-700 text-xs">
                    التوصيل خلال {product.shippingInfo?.deliveryTime || '٢-٣ أيام عمل'} إلى باب منزلك
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800 text-sm">إرجاع سهل</span>
                  </div>
                  <p className="text-blue-700 text-xs">
                    {product.shippingInfo?.returnPolicy || 'إرجاع خلال ٣٠ يومًا'} بدون متاعب
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-purple-800 text-sm">ضمان الجودة</span>
                  </div>
                  <p className="text-purple-700 text-xs">
                    جميع المنتجات تأتي مع شهادة أصالة وضمان
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default ProductDetailsTabs;
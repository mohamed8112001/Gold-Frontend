import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const ProductDetailsTabs = ({ product, reviews }) => {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <Card className="border-0 shadow-xl rounded-3xl">
      <CardHeader className="pb-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="description">الوصف</TabsTrigger>
            <TabsTrigger value="specifications">المواصفات</TabsTrigger>
            <TabsTrigger value="reviews">التقييمات</TabsTrigger>
            <TabsTrigger value="shipping">الشحن</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">وصف المنتج</h3>
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                {product.description}
              </p>

              <h4 className="text-xl font-semibold mb-4">Key Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">المواصفات التقنية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">{key}</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">تقييمات العملاء</h3>
                <Button variant="outline">كتابة تقييم</Button>
              </div>

              <div className="space-y-6">
                {reviews?.map((review) => (
                  <div key={review.id} className="p-6 bg-gray-50 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={review.userAvatar} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">{review.userName}</span>
                          {review.verified && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <Verified className="w-3 h-3 mr-1" />
                              Verified Purchase
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>

                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                        {review.images && (
                          <div className="flex gap-2 mb-4">
                            {review.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Review ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpful})
                          </button>
                          <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors">
                            <ThumbsDown className="w-4 h-4" />
                            Not helpful
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">Shipping & Returns</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Free Shipping</span>
                  </div>
                  <p className="text-green-700">
                    Delivery in {product.shippingInfo?.deliveryTime || '2-3 business days'} to your doorstep
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Easy Returns</span>
                  </div>
                  <p className="text-blue-700">
                    {product.shippingInfo?.returnPolicy || '30 days'} hassle-free return policy
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-800">Quality Guarantee</span>
                  </div>
                  <p className="text-purple-700">
                    All products come with authenticity certificate and warranty
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
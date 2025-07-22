import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingBag,
  MapPin,
  Phone,
  Clock,
  Award,
  Eye,
  MessageSquare,
  Star,
  Verified
} from 'lucide-react';

const ShopInfoSidebar = ({ shop, onVisitShop, onOpenChat }) => {
  if (!shop) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-xl rounded-3xl">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600">معلومات المتجر غير متاحة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shop Info Card */}
      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
              <AvatarImage src={shop.image} />
              <AvatarFallback>
                <ShoppingBag className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-xl text-gray-900">{shop.name}</h3>
                {shop.verified && (
                  <Verified className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(shop.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">
                  {shop.rating ? shop.rating.toFixed(1) : '0.0'}
                </span>
                <span className="text-sm text-gray-600">({shop.reviewCount || 0})</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {shop.badges?.map((badge, index) => (
              <Badge key={index} className="bg-white/80 text-yellow-700 border-yellow-200">
                {badge}
              </Badge>
            ))}
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {shop.description || 'لا يوجد وصف متاح'}
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            {shop.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <div>{shop.address}</div>
                  {shop.area && shop.area !== shop.address && (
                    <div className="text-gray-500">{shop.area}</div>
                  )}
                  {shop.city && shop.city !== shop.area && (
                    <div className="text-gray-500">{shop.city}</div>
                  )}
                </div>
              </div>
            )}

            {shop.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <a
                  href={`tel:${shop.phone}`}
                  className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {shop.phone}
                </a>
              </div>
            )}

            {shop.workingHours && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                <span className="text-sm text-gray-700">{shop.workingHours}</span>
              </div>
            )}

            {shop.established && (
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">تأسس {shop.established}</span>
              </div>
            )}
          </div>

          <Separator />

          {shop.specialties && shop.specialties.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {shop.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
              onClick={onVisitShop}
            >
              <Eye className="w-4 h-4 mr-2" />
              زيارة المتجر
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={onOpenChat}>
                <MessageSquare className="w-4 h-4 mr-1" />
                دردشة
              </Button>
              {shop.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${shop.phone}`}>
                    <Phone className="w-4 h-4 mr-1" />
                    اتصال
                  </a>
                </Button>
              )}
            </div>

            {/* WhatsApp button if available */}
            {shop.whatsapp && (
              <Button variant="outline" size="sm" className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200" asChild>
                <a
                  href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Products Preview */}
      <Card className="border-0 shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">You Might Also Like</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placeholder for related products - you can implement this with real API call */}
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">المنتجات ذات الصلة ستظهر هنا</p>
          </div>

          <Button variant="outline" className="w-full mt-4">
            Browse All Products
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopInfoSidebar;

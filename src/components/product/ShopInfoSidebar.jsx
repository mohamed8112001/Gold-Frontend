import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from "../../context/AuthContext.jsx";

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
    const { user, isAuthenticated, isAdmin, isShopOwner, logout, isRegularUser } =     useAuth();
    

  if (!shop) {
    return (
      <div className="space-y-3">
        <Card className="border-0 rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="text-gray-400 mb-2">
              <ShoppingBag className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-600 text-sm">معلومات المتجر غير متاحة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Shop Info Card */}
      <Card className="border-0 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src={shop.image} />
              <AvatarFallback>
                <ShoppingBag className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-gray-900 truncate">{shop.name}</h3>
                {shop.verified && (
                  <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(shop.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold">
                  {shop.rating ? shop.rating.toFixed(1) : '0.0'}
                </span>
                <span className="text-xs text-gray-600">({shop.reviewCount || 0})</span>
              </div>
            </div>
          </div>

        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <p className="text-gray-600 text-xs leading-relaxed">
              {shop.description || 'لا يوجد وصف متاح'}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            {shop.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3 h-3 text-gray-500 mt-1 flex-shrink-0" />
                <div className="text-xs text-gray-700">
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
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <a
                  href={`tel:${shop.phone}`}
                  className="text-xs text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {shop.phone}
                </a>
              </div>
            )}

            {shop.workingHours && (
              <div className="flex items-start gap-2">
                <Clock className="w-3 h-3 text-gray-500 mt-1 flex-shrink-0" />
                <span className="text-xs text-gray-700">{shop.workingHours}</span>
              </div>
            )}

            {shop.established && (
              <div className="flex items-center gap-2">
                <Award className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-700">تأسس {shop.established}</span>
              </div>
            )}
          </div>

          {shop.specialties && shop.specialties.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">التخصصات</h4>
                <div className="flex flex-wrap gap-1">
                  {shop.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          { !isShopOwner && !isAdmin && ( <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 py-2 text-sm"
              onClick={onVisitShop}
            >
              <Eye className="w-3 h-3 mr-2" />
                                              <p className='m-2'>                    زيارة المتجر   </p>

            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={onOpenChat} className="text-xs py-2">
                <MessageSquare className="w-3 h-3 mr-1" />
                                    <p className='m-2'>                  دردشة </p>

              </Button>
              {shop.phone && (
                <Button variant="outline" size="sm" asChild className="text-xs py-2">
                  <a href={`tel:${shop.phone}`}>
                    <Phone className="w-3 h-3 mr-1" />
                    <p className='m-2'>                  اتصال </p>

                  </a>
                </Button>
              )}
            </div>

            {/* WhatsApp button if available */}
            {shop.whatsapp && (
              <Button variant="outline" size="sm" className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-xs py-2" asChild>
                <a
                  href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="w-3 h-3 mr-2" />
<p className='m-2'>                  واتساب 
</p>                </a>
              </Button>
            )}
          </div>)}
         
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopInfoSidebar;

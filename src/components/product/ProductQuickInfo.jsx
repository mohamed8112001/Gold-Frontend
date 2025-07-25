import React from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  Star, 
  Eye, 
  Calendar, 
  Package, 
  Shield, 
  Truck,
  Award,
  Clock
} from 'lucide-react';

const ProductQuickInfo = ({ product }) => {
  const quickStats = [
    {
      icon: <Eye className="w-4 h-4" />,
      label: 'المشاهدات',
      value: Math.floor(Math.random() * 1000) + 100,
      color: 'text-blue-600'
    },
    {
      icon: <Star className="w-4 h-4" />,
      label: 'التقييم',
      value: `${product.averageRating?.toFixed(1) || '0.0'}/5`,
      color: 'text-yellow-600'
    },
    {
      icon: <Package className="w-4 h-4" />,
      label: 'المخزون',
      value: product.isAvailable ? 'متوفر' : 'غير متوفر',
      color: product.isAvailable ? 'text-green-600' : 'text-red-600'
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: 'تاريخ الإضافة',
      value: new Date(product.createdAt).toLocaleDateString('ar-SA'),
      color: 'text-gray-600'
    }
  ];

  const features = [
    {
      icon: <Shield className="w-4 h-4" />,
      text: 'ضمان الجودة',
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      icon: <Truck className="w-4 h-4" />,
      text: 'شحن مجاني',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      icon: <Award className="w-4 h-4" />,
      text: 'منتج أصلي',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      icon: <Clock className="w-4 h-4" />,
      text: 'إرجاع خلال 30 يوم',
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] border-[#C37C00]/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-[#8A5700] mb-4 flex items-center">
            <span className="mr-2">📊</span>
            إحصائيات سريعة
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickStats.map((stat, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className={`${stat.color} p-2 rounded-lg bg-gray-50`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                  <div className={`font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Features */}
      <Card className="bg-white border-[#FFF0CC]">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-[#8A5700] mb-4 flex items-center">
            <span className="mr-2">✨</span>
            مميزات المنتج
          </h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:shadow-md ${feature.color}`}
              >
                {feature.icon}
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Specifications */}
      <Card className="bg-white border-[#FFF0CC]">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-[#8A5700] mb-4 flex items-center">
            <span className="mr-2">🔧</span>
            المواصفات التقنية
          </h3>
          <div className="space-y-3">
            {product.specifications && Object.entries(product.specifications).map(([key, value], index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">{key}:</span>
                <span className="text-[#8A5700] font-bold">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-3 py-1 text-xs">
          <Shield className="w-3 h-3 mr-1" />
          آمن ومضمون
        </Badge>
        <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-3 py-1 text-xs">
          <Award className="w-3 h-3 mr-1" />
          جودة عالية
        </Badge>
        <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 px-3 py-1 text-xs">
          <Star className="w-3 h-3 mr-1" />
          الأكثر مبيعاً
        </Badge>
      </div>
    </div>
  );
};

export default ProductQuickInfo;

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Package, 
  CreditCard,
  Shield,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useScrollToTop from '../../hooks/useScrollToTop';

const ShippingPolicy = () => {
  // Use scroll to top hook
  useScrollToTop();
  const shippingOptions = [
    {
      icon: Truck,
      title: 'الشحن العادي',
      duration: '3-5 أيام عمل',
      cost: '50 جنيه',
      description: 'خدمة الشحن الاقتصادية للطلبات العادية',
      color: 'text-blue-600'
    },
    {
      icon: Package,
      title: 'الشحن السريع',
      duration: '1-2 أيام عمل',
      cost: '100 جنيه',
      description: 'خدمة الشحن السريع للطلبات العاجلة',
      color: 'text-green-600'
    },
    {
      icon: Shield,
      title: 'الشحن المؤمن',
      duration: '2-3 أيام عمل',
      cost: '150 جنيه',
      description: 'شحن مؤمن للمنتجات عالية القيمة',
      color: 'text-purple-600'
    }
  ];

  const deliveryAreas = [
    {
      area: 'القاهرة الكبرى',
      duration: '1-2 أيام عمل',
      cost: 'مجاني للطلبات أكثر من 1000 جنيه'
    },
    {
      area: 'الإسكندرية',
      duration: '2-3 أيام عمل',
      cost: 'مجاني للطلبات أكثر من 1500 جنيه'
    },
    {
      area: 'المحافظات الأخرى',
      duration: '3-5 أيام عمل',
      cost: 'مجاني للطلبات أكثر من 2000 جنيه'
    }
  ];

  const shippingSteps = [
    {
      step: 1,
      title: 'تأكيد الطلب',
      description: 'سيتم تأكيد طلبك خلال 24 ساعة من الطلب'
    },
    {
      step: 2,
      title: 'التحضير والتغليف',
      description: 'سيتم تحضير وتغليف طلبك بعناية فائقة'
    },
    {
      step: 3,
      title: 'الشحن',
      description: 'سيتم شحن طلبك مع شركة الشحن المختارة'
    },
    {
      step: 4,
      title: 'التتبع والتسليم',
      description: 'ستحصل على رقم التتبع وسيتم التسليم في الموعد المحدد'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <Truck className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              سياسة الشحن والتوصيل
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              نوفر خدمات شحن متنوعة لضمان وصول طلبك بأمان وفي الوقت المحدد
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
            <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors">
              الرئيسية
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-blue-600 font-medium">سياسة الشحن</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-16"
          >
            {/* Shipping Options */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                خيارات الشحن
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {shippingOptions.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4`}>
                      <option.icon className={`w-6 h-6 ${option.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {option.title}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{option.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-blue-600">{option.cost}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {option.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Delivery Areas */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                مناطق التوصيل
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {deliveryAreas.map((area, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center mb-4">
                      <MapPin className="w-6 h-6 text-blue-600 ml-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {area.area}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{area.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">{area.cost}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Shipping Process */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                عملية الشحن
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {shippingSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 text-white font-bold text-lg">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <AlertCircle className="w-8 h-8 text-amber-600 ml-3" />
                <h2 className="text-2xl font-bold text-amber-900">
                  ملاحظات مهمة
                </h2>
              </div>
              <div className="space-y-4 text-amber-800">
                <p>• يتم احتساب أوقات التوصيل من تاريخ تأكيد الطلب وليس من تاريخ الطلب</p>
                <p>• لا يتم التوصيل في أيام الجمعة والعطلات الرسمية</p>
                <p>• يجب توفر شخص لاستلام الطلب في العنوان المحدد</p>
                <p>• في حالة عدم وجود أحد لاستلام الطلب، سيتم إعادة المحاولة في اليوم التالي</p>
                <p>• يحق للعميل فحص المنتج قبل الاستلام والرفض في حالة وجود عيب ظاهر</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
                تتبع طلبك أو تحتاج مساعدة؟
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">خدمة العملاء</p>
                    <p className="text-blue-800">+20 123 456 7890</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">الشحن والتوصيل</p>
                    <p className="text-blue-800">shipping@dibla.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-gray-500 text-sm">
              <p>آخر تحديث: يناير 2024</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ShippingPolicy;

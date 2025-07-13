import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  CreditCard,
  Phone,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useScrollToTop from '../../hooks/useScrollToTop';

const ReturnsPolicy = () => {
  // Use scroll to top hook
  useScrollToTop();

  const returnConditions = [
    {
      icon: Clock,
      title: 'مدة الإرجاع',
      description: 'يمكن إرجاع المنتجات خلال 14 يوم من تاريخ الشراء',
      color: 'text-blue-600'
    },
    {
      icon: Package,
      title: 'حالة المنتج',
      description: 'يجب أن يكون المنتج في حالته الأصلية وغير مستخدم',
      color: 'text-green-600'
    },
    {
      icon: CheckCircle,
      title: 'الفاتورة الأصلية',
      description: 'يجب توفر الفاتورة الأصلية أو إيصال الشراء',
      color: 'text-amber-600'
    },
    {
      icon: RotateCcw,
      title: 'التغليف الأصلي',
      description: 'يجب أن يكون المنتج في تغليفه الأصلي مع جميع الملحقات',
      color: 'text-purple-600'
    }
  ];

  const nonReturnableItems = [
    'المنتجات المخصصة أو المصنوعة حسب الطلب',
    'المنتجات التي تم تعديلها أو نقشها',
    'المنتجات المستخدمة أو التالفة بسبب سوء الاستخدام',
    'المنتجات التي مر عليها أكثر من 14 يوم'
  ];

  const returnSteps = [
    {
      step: 1,
      title: 'تواصل معنا',
      description: 'اتصل بخدمة العملاء أو قم بزيارة المحل لطلب الإرجاع'
    },
    {
      step: 2,
      title: 'فحص المنتج',
      description: 'سيتم فحص المنتج للتأكد من مطابقته لشروط الإرجاع'
    },
    {
      step: 3,
      title: 'الموافقة على الإرجاع',
      description: 'في حالة الموافقة، سيتم إجراء عملية الإرجاع'
    },
    {
      step: 4,
      title: 'استرداد المبلغ',
      description: 'سيتم استرداد المبلغ خلال 3-7 أيام عمل'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <RotateCcw className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              سياسة الإرجاع والاستبدال
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              نحن ملتزمون بضمان رضاك التام عن مشترياتك. تعرف على شروط وأحكام الإرجاع والاستبدال
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
            <Link to="/" className="text-gray-500 hover:text-amber-600 transition-colors">
              الرئيسية
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-amber-600 font-medium">سياسة الإرجاع</span>
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
            {/* Return Conditions */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                شروط الإرجاع
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {returnConditions.map((condition, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4`}>
                      <condition.icon className={`w-6 h-6 ${condition.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {condition.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {condition.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Return Process */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                خطوات الإرجاع
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {returnSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mb-4 text-white font-bold text-lg">
                        {step.step}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    {index < returnSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                        <ArrowLeft className="w-6 h-6 text-amber-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Non-Returnable Items */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <XCircle className="w-8 h-8 text-red-600 ml-3" />
                <h2 className="text-2xl font-bold text-red-900">
                  المنتجات غير القابلة للإرجاع
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nonReturnableItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Information */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <CreditCard className="w-8 h-8 text-green-600 ml-3" />
                <h2 className="text-2xl font-bold text-green-900">
                  معلومات الاسترداد
                </h2>
              </div>
              <div className="space-y-4 text-green-800">
                <p>• سيتم استرداد المبلغ بنفس طريقة الدفع المستخدمة في الشراء</p>
                <p>• مدة الاسترداد: 3-7 أيام عمل للبطاقات الائتمانية</p>
                <p>• مدة الاسترداد: 1-3 أيام عمل للدفع النقدي</p>
                <p>• لا يتم استرداد رسوم الشحن إلا في حالة وجود عيب في المنتج</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">
                تحتاج مساعدة؟
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Phone className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">اتصل بنا</p>
                    <p className="text-amber-800">+20 123 456 7890</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Mail className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">راسلنا</p>
                    <p className="text-amber-800">returns@dibla.com</p>
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

export default ReturnsPolicy;

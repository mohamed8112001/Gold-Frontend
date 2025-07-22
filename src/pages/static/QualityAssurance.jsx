import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Award,
  CheckCircle,
  Star,
  Eye,
  Microscope,
  FileCheck,
  Users,
  Phone,
  Mail,
  Clock,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useScrollToTop from '../../hooks/useScrollToTop';

const QualityAssurance = () => {
  // Use scroll to top hook
  useScrollToTop();
  const qualityStandards = [
    {
      icon: FileCheck,
      title: 'شهادات الجودة',
      description: 'جميع منتجاتنا معتمدة ومطابقة للمعايير الدولية للذهب والمجوهرات',
      color: 'text-[#A37F41]'
    },
    {
      icon: Microscope,
      title: 'فحص دقيق',
      description: 'كل قطعة تخضع لفحص دقيق للتأكد من جودة المعدن ونقاء الذهب',
      color: 'text-[#8A6C37]'
    },
    {
      icon: Eye,
      title: 'مراقبة الجودة',
      description: 'نظام مراقبة جودة صارم في جميع مراحل الإنتاج والتصنيع',
      color: 'text-[#6D552C]'
    },
    {
      icon: Award,
      title: 'ضمان الأصالة',
      description: 'نضمن أصالة جميع المنتجات مع شهادات الضمان المعتمدة',
      color: 'text-[#C5A56D]'
    }
  ];

  const qualityFeatures = [
    {
      title: 'نقاء الذهب',
      description: 'نضمن نقاء الذهب المعلن عنه (18، 21، 24 قيراط)',
      percentage: '100%'
    },
    {
      title: 'جودة التصنيع',
      description: 'أعلى معايير التصنيع والحرفية في كل قطعة',
      percentage: '100%'
    },
    {
      title: 'دقة الوزن',
      description: 'دقة في وزن الذهب مع هامش خطأ لا يتجاوز 0.1%',
      percentage: '99.9%'
    },
    {
      title: 'رضا العملاء',
      description: 'معدل رضا عملائنا عن جودة المنتجات',
      percentage: '98%'
    }
  ];

  const qualityProcess = [
    {
      step: 1,
      title: 'اختيار المواد الخام',
      description: 'نختار أجود أنواع الذهب والأحجار الكريمة من مصادر موثوقة'
    },
    {
      step: 2,
      title: 'عملية التصنيع',
      description: 'تصنيع دقيق باستخدام أحدث التقنيات والأدوات المتطورة'
    },
    {
      step: 3,
      title: 'الفحص والاختبار',
      description: 'فحص شامل لكل قطعة للتأكد من مطابقتها للمعايير المطلوبة'
    },
    {
      step: 4,
      title: 'الضمان والتوثيق',
      description: 'إصدار شهادات الضمان والأصالة لكل منتج'
    }
  ];

  const warranties = [
    {
      type: 'ضمان الأصالة',
      duration: 'مدى الحياة',
      description: 'نضمن أصالة الذهب ونقاءه المعلن عنه'
    },
    {
      type: 'ضمان التصنيع',
      duration: 'سنتان',
      description: 'ضمان ضد عيوب التصنيع والحرفية'
    },
    {
      type: 'ضمان الأحجار',
      duration: 'سنة واحدة',
      description: 'ضمان ضد سقوط أو تلف الأحجار الكريمة'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/30">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ضمان الجودة والأصالة
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              نلتزم بأعلى معايير الجودة لضمان حصولك على أفضل المنتجات الذهبية الأصيلة
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
            <Link to="/" className="text-gray-500 hover:text-yellow-600 transition-colors">
              الرئيسية
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-yellow-600 font-medium">ضمان الجودة</span>
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
            {/* Quality Standards */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                معايير الجودة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {qualityStandards.map((standard, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6  border border-gray-100 hover: transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4`}>
                      <standard.icon className={`w-6 h-6 ${standard.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {standard.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {standard.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quality Features */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                مؤشرات الجودة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {qualityFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6  border border-gray-100 text-center"
                  >
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {feature.percentage}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quality Process */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                عملية ضمان الجودة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {qualityProcess.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6  border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mb-4 text-white font-bold text-lg">
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

            {/* Warranties */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                أنواع الضمان
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {warranties.map((warranty, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200"
                  >
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-6 h-6 text-yellow-600 ml-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {warranty.type}
                      </h3>
                    </div>
                    <div className="mb-3">
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                        {warranty.duration}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {warranty.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-gradient-to-r from-[#F8F4ED] to-[#F0E8DB] border border-[#E2D2B6] rounded-xl p-8">
              <div className="text-center mb-8">
                <FileCheck className="w-16 h-16 text-[#A37F41] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  الشهادات والاعتمادات
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#F0E8DB] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-[#A37F41]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">ISO 9001</h3>
                  <p className="text-gray-600 text-sm">شهادة إدارة الجودة الدولية</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">اعتماد الغرفة التجارية</h3>
                  <p className="text-gray-600 text-sm">عضوية معتمدة في غرفة تجارة المجوهرات</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">ضمان الأصالة</h3>
                  <p className="text-gray-600 text-sm">شهادات أصالة معتمدة لكل منتج</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                لديك استفسار حول الجودة؟
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Phone className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-gray-900">قسم ضمان الجودة</p>
                    <p className="text-gray-700">+20 123 456 7890</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Mail className="w-6 h-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-gray-900">البريد الإلكتروني</p>
                    <p className="text-gray-700">quality@dibla.com</p>
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

export default QualityAssurance;

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { 
  Shield, 
  Eye,
  Database,
  UserCheck,
  FileText,
  Mail,
  CheckCircle,
  Info
} from 'lucide-react';
import useScrollToTop from '../../hooks/useScrollToTop';

const PrivacyPolicy = () => {
  // Use scroll to top hook
  useScrollToTop();
  const dataTypes = [
    {
      title: 'البيانات الشخصية',
      description: 'الاسم، البريد الإلكتروني، رقم الهاتف',
      icon: UserCheck,
      required: true
    },
    {
      title: 'بيانات الموقع',
      description: 'المدينة، المنطقة لعرض المحلات القريبة',
      icon: Eye,
      required: false
    },
    {
      title: 'بيانات الاستخدام',
      description: 'كيفية تفاعلك مع المنصة والصفحات المزارة',
      icon: Database,
      required: false
    },
    {
      title: 'بيانات الجهاز',
      description: 'نوع المتصفح، نظام التشغيل، عنوان IP',
      icon: Shield,
      required: false
    }
  ];

  const securityMeasures = [
    'تشفير SSL لجميع البيانات المنقولة',
    'تشفير قواعد البيانات',
    'مراقبة أمنية على مدار الساعة',
    'نسخ احتياطية منتظمة',
    'تحديثات أمنية دورية',
    'فريق أمان متخصص'
  ];

  const userRights = [
    {
      title: 'الحق في الوصول',
      description: 'يمكنك طلب نسخة من بياناتك الشخصية المحفوظة لدينا'
    },
    {
      title: 'الحق في التصحيح',
      description: 'يمكنك طلب تصحيح أي بيانات غير صحيحة'
    },
    {
      title: 'الحق في الحذف',
      description: 'يمكنك طلب حذف بياناتك الشخصية'
    },
    {
      title: 'الحق في النقل',
      description: 'يمكنك طلب نقل بياناتك إلى خدمة أخرى'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-yellow-400/5 to-amber-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              سياسة الخصوصية
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              نحن ملتزمون بحماية خصوصيتك وأمان بياناتك الشخصية
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">التزامنا بخصوصيتك</h3>
                  <p className="text-blue-800 leading-relaxed">
                    في منصة دبلة، نحن ملتزمون بحماية خصوصيتك وأمان بياناتك الشخصية. 
                    هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتك عند استخدام خدماتنا.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Data Collection */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">البيانات التي نجمعها</h2>
            <p className="text-lg text-gray-600">نجمع أنواعاً مختلفة من البيانات لتوفير وتحسين خدماتنا</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                          <type.icon className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {type.title}
                        </CardTitle>
                      </div>
                      {type.required && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          مطلوب
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{type.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">أمان البيانات</h2>
            <p className="text-lg text-gray-600">نستخدم أحدث تقنيات الأمان لحماية بياناتك</p>
          </motion.div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">أمان متقدم</h3>
                <p className="text-green-800 leading-relaxed">
                  نستخدم أحدث تقنيات الأمان لحماية بياناتك من الوصول غير المصرح به أو التسريب.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityMeasures.map((measure, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{measure}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Rights */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">حقوقك في البيانات</h2>
            <p className="text-lg text-gray-600">لديك حقوق مهمة فيما يتعلق ببياناتك الشخصية</p>
          </motion.div>

          <div className="space-y-4">
            {userRights.map((right, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{right.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{right.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">تواصل معنا</h2>
            <p className="text-lg text-gray-600 mb-8">
              إذا كان لديك أي أسئلة حول سياسة الخصوصية، لا تتردد في التواصل معنا
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Mail className="w-6 h-6 text-amber-500" />
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      البريد الإلكتروني
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">للاستفسارات العامة:</p>
                  <p className="font-medium text-gray-900">info@dibla.com</p>
                  <p className="text-gray-600 mb-2 mt-4">لأمور الخصوصية:</p>
                  <p className="font-medium text-gray-900">privacy@dibla.com</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Shield className="w-6 h-6 text-amber-500" />
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      الهاتف
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">خط الدعم:</p>
                  <p className="font-medium text-gray-900">+20 100 123 4567</p>
                  <p className="text-gray-600 mb-2 mt-4">أوقات العمل:</p>
                  <p className="font-medium text-gray-900">السبت - الخميس: 9:00 ص - 6:00 م</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-8 max-w-4xl mx-auto">
              <h4 className="text-lg font-semibold text-amber-900 mb-3">تحديثات السياسة</h4>
              <p className="text-amber-800 leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات مهمة عبر البريد الإلكتروني 
                أو من خلال إشعار على المنصة. ننصحك بمراجعة هذه الصفحة بانتظام للاطلاع على آخر التحديثات.
              </p>
              <p className="text-amber-800 text-sm mt-4">
                <strong>آخر تحديث:</strong> يناير 2024
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;

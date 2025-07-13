import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { 
  FileText, 
  Scale,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  Info,
  Mail
} from 'lucide-react';
import useScrollToTop from '../../hooks/useScrollToTop';

const TermsConditions = () => {
  // Use scroll to top hook
  useScrollToTop();
  const services = [
    {
      title: 'للعملاء',
      items: [
        'البحث عن محلات الذهب',
        'مقارنة الأسعار والخدمات',
        'حجز المواعيد',
        'قراءة وكتابة التقييمات',
        'حفظ المفضلة',
        'دعم العملاء'
      ],
      icon: Users,
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: 'لأصحاب المحلات',
      items: [
        'عرض معلومات المحل',
        'إدارة المواعيد',
        'عرض المنتجات',
        'التواصل مع العملاء',
        'إحصائيات الأداء',
        'دعم تقني متخصص'
      ],
      icon: Shield,
      color: 'from-amber-400 to-yellow-600'
    }
  ];

  const accountRules = [
    {
      title: 'دقة المعلومات',
      description: 'يجب تقديم معلومات صحيحة ومحدثة عند التسجيل',
      requirements: [
        'الاسم الحقيقي',
        'بريد إلكتروني صالح',
        'رقم هاتف صحيح',
        'معلومات المحل (لأصحاب المحلات)'
      ]
    },
    {
      title: 'أمان الحساب',
      description: 'أنت مسؤول عن الحفاظ على أمان حسابك',
      requirements: [
        'كلمة مرور قوية',
        'عدم مشاركة بيانات الدخول',
        'إبلاغنا عن أي نشاط مشبوه',
        'تسجيل الخروج من الأجهزة العامة'
      ]
    }
  ];

  const conductRules = {
    acceptable: [
      'التعامل بأدب واحترام مع الآخرين',
      'تقديم تقييمات صادقة ومفيدة',
      'احترام خصوصية المستخدمين الآخرين',
      'الالتزام بالمواعيد المحجوزة',
      'الإبلاغ عن أي مشاكل أو انتهاكات',
      'استخدام المنصة للأغراض المخصصة لها'
    ],
    prohibited: [
      'التحرش أو الإساءة للمستخدمين الآخرين',
      'نشر محتوى مسيء أو غير لائق',
      'التلاعب في التقييمات أو المراجعات',
      'انتحال الشخصية أو تقديم معلومات كاذبة',
      'محاولة اختراق أو إتلاف المنصة',
      'استخدام المنصة لأنشطة غير قانونية'
    ]
  };

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
              الشروط والأحكام
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              القواعد والشروط التي تحكم استخدام منصة دبلة
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
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">مرحباً بك في منصة دبلة</h3>
                  <p className="text-blue-800 leading-relaxed">
                    هذه الشروط والأحكام تحكم استخدامك لمنصة دبلة وجميع الخدمات المرتبطة بها. 
                    يرجى قراءتها بعناية قبل استخدام خدماتنا.
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ما هي منصة دبلة؟</h3>
              <p className="text-gray-600 mb-4">
                دبلة هي منصة إلكترونية تهدف إلى ربط مشتري الذهب والمجوهرات بأصحاب المحلات المعتمدين في مصر. 
                نوفر خدمات البحث، المقارنة، حجز المواعيد، والتقييمات لتسهيل عملية الشراء.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  <strong>آخر تحديث:</strong> يناير 2024 | 
                  <strong> سريان المفعول:</strong> هذه الشروط سارية المفعول اعتباراً من تاريخ آخر تحديث
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">الخدمات المقدمة</h2>
            <p className="text-lg text-gray-600">منصة دبلة تقدم مجموعة من الخدمات لتسهيل عملية شراء الذهب والمجوهرات</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((category, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {category.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.items.map((service, serviceIndex) => (
                      <li key={serviceIndex} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-600">{service}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">حدود الخدمة</h4>
            <ul className="space-y-2 text-gray-600">
              <li>• نحن منصة وساطة ولسنا بائعين مباشرين للذهب</li>
              <li>• لا نتحمل مسؤولية جودة المنتجات أو دقة الأسعار</li>
              <li>• التعاملات المالية تتم مباشرة بين العميل والمحل</li>
              <li>• نحتفظ بالحق في تعديل أو إيقاف أي خدمة مؤقتاً</li>
              <li>• بعض الخدمات قد تتطلب رسوم اشتراك لأصحاب المحلات</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Account Rules */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">الحسابات والتسجيل</h2>
            <p className="text-lg text-gray-600">لاستخدام بعض خدماتنا، ستحتاج إلى إنشاء حساب</p>
          </motion.div>

          <div className="space-y-6">
            {accountRules.map((section, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </CardTitle>
                  <p className="text-gray-600">{section.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-red-900 mb-2">تعليق أو إغلاق الحساب</h4>
                <p className="text-red-800 leading-relaxed mb-3">
                  نحتفظ بالحق في تعليق أو إغلاق حسابك في الحالات التالية:
                </p>
                <ul className="space-y-1 text-red-800">
                  <li>• انتهاك الشروط والأحكام</li>
                  <li>• تقديم معلومات كاذبة أو مضللة</li>
                  <li>• سوء استخدام المنصة أو إزعاج المستخدمين الآخرين</li>
                  <li>• أنشطة احتيالية أو مشبوهة</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conduct Rules */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">قواعد السلوك المقبول</h2>
            <p className="text-lg text-gray-600">للحفاظ على بيئة آمنة ومحترمة لجميع المستخدمين</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-green-50 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-lg font-semibold text-green-900">
                    السلوك المقبول
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-800">
                  {conductRules.acceptable.map((rule, index) => (
                    <li key={index}>• {rule}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 bg-red-50 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <CardTitle className="text-lg font-semibold text-red-900">
                    السلوك المرفوض
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-red-800">
                  {conductRules.prohibited.map((rule, index) => (
                    <li key={index}>• {rule}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">التقييمات والمراجعات</h4>
            <p className="text-blue-800 mb-3">
              التقييمات والمراجعات جزء مهم من تجربة المستخدمين. يجب أن تكون:
            </p>
            <ul className="space-y-2 text-blue-800">
              <li>• صادقة ومبنية على تجربة حقيقية</li>
              <li>• محترمة ولا تحتوي على لغة مسيئة</li>
              <li>• مفيدة للمستخدمين الآخرين</li>
              <li>• خالية من المعلومات الشخصية للآخرين</li>
            </ul>
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
              إذا كان لديك أي أسئلة حول الشروط والأحكام، لا تتردد في التواصل معنا
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
                  <p className="text-gray-600 mb-2">للاستفسارات القانونية:</p>
                  <p className="font-medium text-gray-900">legal@dibla.com</p>
                  <p className="text-gray-600 mb-2 mt-4">للاستفسارات العامة:</p>
                  <p className="font-medium text-gray-900">info@dibla.com</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Scale className="w-6 h-6 text-amber-500" />
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      الهاتف
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">خط الدعم القانوني:</p>
                  <p className="font-medium text-gray-900">+20 100 123 4567</p>
                  <p className="text-gray-600 mb-2 mt-4">أوقات العمل:</p>
                  <p className="font-medium text-gray-900">السبت - الخميس: 9:00 ص - 6:00 م</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-8 max-w-4xl mx-auto">
              <h4 className="text-lg font-semibold text-amber-900 mb-3">تحديثات الشروط</h4>
              <p className="text-amber-800 leading-relaxed">
                نحتفظ بالحق في تحديث هذه الشروط والأحكام من وقت لآخر. سنخطرك بأي تغييرات مهمة عبر البريد الإلكتروني 
                أو من خلال إشعار على المنصة. استمرارك في استخدام المنصة بعد التحديثات يعني موافقتك على الشروط الجديدة.
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

export default TermsConditions;

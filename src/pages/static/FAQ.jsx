import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  User,
  ShoppingBag,
  CreditCard,
  Settings,
  Shield,
  Star,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react';
import useScrollToTop from '../../hooks/useScrollToTop';

const FAQ = () => {
  // Use scroll to top hook
  useScrollToTop();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: 'all', name: 'جميع الأسئلة', icon: HelpCircle, count: 20 },
    { id: 'account', name: 'الحساب والتسجيل', icon: User, count: 5 },
    { id: 'shopping', name: 'التسوق والشراء', icon: ShoppingBag, count: 6 },
    { id: 'payment', name: 'الدفع والأسعار', icon: CreditCard, count: 4 },
    { id: 'security', name: 'الأمان والخصوصية', icon: Shield, count: 3 },
    { id: 'sellers', name: 'أصحاب المحلات', icon: Star, count: 2 }
  ];

  const faqs = [
    // Account & Registration
    {
      id: 1,
      category: 'account',
      question: 'كيف يمكنني إنشاء حساب جديد على منصة دبلة؟',
      answer: 'يمكنك إنشاء حساب جديد بسهولة من خلال الخطوات التالية:\n1. انقر على زر "تسجيل" في أعلى الصفحة\n2. اختر نوع الحساب (عميل أو صاحب محل)\n3. املأ البيانات المطلوبة (الاسم، البريد الإلكتروني، كلمة المرور)\n4. أكد بريدك الإلكتروني من خلال الرسالة التي ستصلك\n5. ابدأ في استخدام المنصة فوراً!'
    },
    {
      id: 2,
      category: 'account',
      question: 'نسيت كلمة المرور، كيف يمكنني استعادتها؟',
      answer: 'لا تقلق! يمكنك استعادة كلمة المرور بسهولة:\n1. انقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول\n2. أدخل بريدك الإلكتروني المسجل\n3. ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور\n4. انقر على الرابط وأدخل كلمة مرور جديدة\n5. احفظ كلمة المرور الجديدة في مكان آمن'
    },
    {
      id: 3,
      category: 'account',
      question: 'كيف يمكنني تحديث بياناتي الشخصية؟',
      answer: 'يمكنك تحديث بياناتك الشخصية من خلال:\n1. تسجيل الدخول إلى حسابك\n2. الانتقال إلى صفحة "الملف الشخصي"\n3. النقر على "تعديل البيانات"\n4. تحديث المعلومات المطلوبة\n5. النقر على "حفظ التغييرات"'
    },
    {
      id: 4,
      category: 'account',
      question: 'هل يمكنني ربط حسابي بـ Google؟',
      answer: 'نعم! يمكنك تسجيل الدخول باستخدام حساب Google الخاص بك، أو ربط حسابك الحالي بـ Google من خلال إعدادات الحساب.'
    },
    {
      id: 5,
      category: 'account',
      question: 'كيف يمكنني حذف حسابي نهائياً؟',
      answer: 'إذا كنت ترغب في حذف حسابك نهائياً، يرجى التواصل مع فريق الدعم عبر البريد الإلكتروني أو الهاتف. سنقوم بمساعدتك في إجراءات الحذف مع الحفاظ على خصوصيتك.'
    },

    // Shopping & Purchasing
    {
      id: 6,
      category: 'shopping',
      question: 'كيف يمكنني البحث عن محلات الذهب في منطقتي؟',
      answer: 'يمكنك العثور على محلات الذهب القريبة منك بعدة طرق:\n1. استخدم شريط البحث في الصفحة الرئيسية\n2. انتقل إلى صفحة "المحلات" واستخدم فلاتر الموقع\n3. حدد المدينة والمنطقة المطلوبة\n4. استخدم الخريطة التفاعلية لرؤية المحلات على الخريطة\n5. رتب النتائج حسب المسافة أو التقييم'
    },
    {
      id: 7,
      category: 'shopping',
      question: 'كيف يمكنني حجز موعد مع محل ذهب؟',
      answer: 'حجز موعد سهل وسريع:\n1. ادخل إلى صفحة المحل المطلوب\n2. انقر على زر "حجز موعد"\n3. اختر التاريخ المناسب من التقويم\n4. حدد الوقت من الأوقات المتاحة\n5. أكد الحجز وستصلك رسالة تأكيد'
    },
    {
      id: 8,
      category: 'shopping',
      question: 'هل يمكنني إلغاء أو تعديل موعد محجوز؟',
      answer: 'نعم، يمكنك إدارة مواعيدك بسهولة:\n1. انتقل إلى صفحة "مواعيدي" في حسابك\n2. اختر الموعد الذي تريد تعديله أو إلغاءه\n3. انقر على "تعديل" أو "إلغاء"\n4. يجب أن يكون ذلك قبل 24 ساعة على الأقل من الموعد'
    },
    {
      id: 9,
      category: 'shopping',
      question: 'كيف يمكنني تقييم محل ذهب؟',
      answer: 'يمكنك تقييم المحلات بعد زيارتها:\n1. انتقل إلى صفحة المحل\n2. انقر على "إضافة تقييم"\n3. اختر عدد النجوم (من 1 إلى 5)\n4. اكتب تعليقك عن التجربة\n5. انقر على "نشر التقييم"'
    },
    {
      id: 10,
      category: 'shopping',
      question: 'كيف يمكنني إضافة منتجات إلى المفضلة؟',
      answer: 'لحفظ المنتجات المفضلة لديك:\n1. انتقل إلى صفحة المنتج\n2. انقر على أيقونة القلب ♥\n3. سيتم حفظ المنتج في قائمة المفضلة\n4. يمكنك الوصول للمفضلة من القائمة الرئيسية'
    },
    {
      id: 11,
      category: 'shopping',
      question: 'ما هي معايير اختيار أفضل محل ذهب؟',
      answer: 'ننصحك بالنظر إلى:\n1. تقييمات العملاء السابقين\n2. سنوات الخبرة في السوق\n3. تنوع المنتجات المتاحة\n4. الموقع والسهولة في الوصول\n5. أسعار الصنعة والخدمات\n6. شهادات الجودة والضمانات'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
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
              الأسئلة الشائعة
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              إجابات شاملة على أكثر الأسئلة شيوعاً حول استخدام منصة دبلة
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                type="text"
                placeholder="ابحث في الأسئلة الشائعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">تصفح حسب الموضوع</h2>
            <p className="text-lg text-gray-600">اختر الموضوع الذي تبحث عنه</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Button
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full h-auto p-4 flex flex-col items-center space-y-2 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0'
                      : 'text-gray-600 hover:text-amber-600 bg-white/80 backdrop-blur-sm'
                  }`}
                >
                  <category.icon className="w-6 h-6" />
                  <span className="text-sm font-medium text-center leading-tight">{category.name}</span>
                  <span className="text-xs opacity-75">({category.count})</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs List */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {filteredFaqs.length} سؤال متاح
            </h2>
            <p className="text-lg text-gray-600">انقر على أي سؤال لرؤية الإجابة التفصيلية</p>
          </motion.div>

          {filteredFaqs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">لم نجد أسئلة مطابقة</h3>
              <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تصفح جميع الأسئلة</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader
                      className="cursor-pointer hover:bg-gray-50/50 transition-colors duration-200"
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900 text-right flex-1 leading-relaxed">
                          {faq.question}
                        </CardTitle>
                        <div className="ml-4 flex-shrink-0">
                          {expandedFaq === faq.id ? (
                            <ChevronDown className="w-6 h-6 text-amber-500 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="w-6 h-6 text-gray-400 transition-transform duration-200" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {expandedFaq === faq.id && (
                      <CardContent className="pt-0">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100 pt-4"
                        >
                          <div className="prose prose-gray max-w-none">
                            {faq.answer.split('\n').map((line, lineIndex) => (
                              <p key={lineIndex} className="text-gray-600 leading-relaxed mb-2 last:mb-0">
                                {line}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              لم تجد إجابة لسؤالك؟
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              فريق الدعم لدينا جاهز لمساعدتك في أي وقت
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <Button
                size="lg"
                className="bg-white text-amber-600 hover:bg-gray-100 font-bold px-6 py-3 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                دردشة مباشرة
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-amber-600 font-bold px-6 py-3 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                اتصل بنا
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-amber-600 font-bold px-6 py-3 flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                راسلنا
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-amber-600 mb-2">20+</div>
              <div className="text-gray-600 font-medium">سؤال شائع</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-amber-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">دعم متواصل</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-amber-600 mb-2">&lt;5 دقائق</div>
              <div className="text-gray-600 font-medium">وقت الاستجابة</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-amber-600 mb-2">98%</div>
              <div className="text-gray-600 font-medium">رضا العملاء</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
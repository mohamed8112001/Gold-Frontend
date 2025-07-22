import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
  Search,
  HelpCircle,
  Book,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  User,
  ShoppingBag,
  CreditCard,
  Settings,
  Shield,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import useScrollToTop from '../../hooks/useScrollToTop';

const HelpCenter = () => {
  // Use scroll to top hook
  useScrollToTop();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: 'all', name: 'جميع المواضيع', icon: Book, count: 24 },
    { id: 'account', name: 'الحساب والتسجيل', icon: User, count: 6 },
    { id: 'shopping', name: 'التسوق والشراء', icon: ShoppingBag, count: 8 },
    { id: 'payment', name: 'الدفع والفواتير', icon: CreditCard, count: 5 },
    { id: 'security', name: 'الأمان والخصوصية', icon: Shield, count: 3 },
    { id: 'sellers', name: 'أصحاب المحلات', icon: Star, count: 2 }
  ];

  const quickActions = [
    {
      title: 'تواصل معنا',
      description: 'احصل على مساعدة فورية من فريق الدعم',
      icon: MessageCircle,
      action: 'chat',
      color: 'bg-blue-500'
    },
    {
      title: 'اتصل بنا',
      description: 'تحدث مع أحد ممثلي خدمة العملاء',
      icon: Phone,
      action: 'call',
      color: 'bg-green-500'
    },
    {
      title: 'راسلنا',
      description: 'أرسل استفسارك عبر البريد الإلكتروني',
      icon: Mail,
      action: 'email',
      color: 'bg-purple-500'
    }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'كيف يمكنني إنشاء حساب جديد على المنصة؟',
      answer: 'يمكنك إنشاء حساب جديد بسهولة من خلال النقر على زر "تسجيل" في أعلى الصفحة، ثم اختيار نوع الحساب (عميل أو صاحب محل) وملء البيانات المطلوبة. ستحتاج إلى تأكيد بريدك الإلكتروني لتفعيل الحساب.'
    },
    {
      id: 2,
      category: 'account',
      question: 'نسيت كلمة المرور، كيف يمكنني استعادتها؟',
      answer: 'انقر على "نسيت كلمة المرور" في صفحة تسجيل الدخول، ثم أدخل بريدك الإلكتروني. ستصلك رسالة تحتوي على رابط لإعادة تعيين كلمة المرور.'
    },
    {
      id: 3,
      category: 'shopping',
      question: 'كيف يمكنني البحث عن محلات الذهب في منطقتي؟',
      answer: 'استخدم خاصية البحث في الصفحة الرئيسية أو انتقل إلى صفحة "المحلات" واستخدم فلاتر الموقع لتحديد المدينة والمنطقة المطلوبة. يمكنك أيضاً استخدام الخريطة التفاعلية لرؤية المحلات القريبة منك.'
    },
    {
      id: 4,
      category: 'shopping',
      question: 'كيف يمكنني حجز موعد مع محل ذهب؟',
      answer: 'ادخل إلى صفحة المحل المطلوب، انقر على "حجز موعد"، اختر التاريخ والوقت المناسب من الأوقات المتاحة، ثم أكد الحجز. ستصلك رسالة تأكيد على بريدك الإلكتروني ورقم هاتفك.'
    },
    {
      id: 5,
      category: 'shopping',
      question: 'هل يمكنني إلغاء أو تعديل موعد محجوز؟',
      answer: 'نعم، يمكنك إلغاء أو تعديل المواعيد من خلال صفحة "مواعيدي" في حسابك، بشرط أن يكون ذلك قبل 24 ساعة على الأقل من موعد الزيارة المحجوزة.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'هل هناك رسوم على استخدام المنصة؟',
      answer: 'استخدام المنصة مجاني تماماً للعملاء. يمكنك تصفح المحلات والمنتجات وحجز المواعيد دون أي رسوم. أصحاب المحلات لديهم خطط اشتراك مختلفة حسب الخدمات المطلوبة.'
    },
    {
      id: 7,
      category: 'security',
      question: 'كيف تحمون بياناتي الشخصية؟',
      answer: 'نحن نأخذ أمان بياناتك على محمل الجد. نستخدم تشفير SSL لحماية جميع البيانات المنقولة، ولا نشارك معلوماتك الشخصية مع أطراف ثالثة دون موافقتك الصريحة.'
    },
    {
      id: 8,
      category: 'sellers',
      question: 'كيف يمكنني تسجيل محلي على المنصة؟',
      answer: 'أنشئ حساب جديد واختر "صاحب محل"، ثم املأ بيانات المحل والوثائق المطلوبة. سيقوم فريقنا بمراجعة طلبك والموافقة عليه خلال 2-3 أيام عمل.'
    }
  ];

  const guides = [
    {
      title: 'دليل المبتدئين لاستخدام المنصة',
      description: 'تعلم كيفية استخدام جميع ميزات المنصة خطوة بخطوة',
      duration: '10 دقائق',
      steps: 5
    },
    {
      title: 'كيفية اختيار أفضل محل ذهب',
      description: 'نصائح مهمة لاختيار المحل المناسب لاحتياجاتك',
      duration: '7 دقائق',
      steps: 4
    },
    {
      title: 'دليل أصحاب المحلات',
      description: 'كل ما تحتاج معرفته لإدارة محلك على المنصة',
      duration: '15 دقائق',
      steps: 8
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#FFF8E6]/30">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C37C00]/10 via-[#E6A500]/5 to-[#A66A00]/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              مركز المساعدة
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#C37C00] to-[#E6A500] mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              نحن هنا لمساعدتك! ابحث عن إجابات لأسئلتك أو تواصل مع فريق الدعم
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                type="text"
                placeholder="ابحث عن إجابة لسؤالك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">تحتاج مساعدة فورية؟</h2>
            <p className="text-lg text-gray-600">اختر الطريقة المناسبة للتواصل معنا</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover: transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm cursor-pointer hover:scale-105">
                  <CardHeader>
                    <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4">
                      {action.description}
                    </CardDescription>
                    <Button className="bg-gradient-to-r from-[#C37C00] to-[#E6A500] hover:from-[#A66A00] hover:to-[#C37C00] text-white">
                      ابدأ الآن
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-[#FFF8E6]/50">
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
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
                  className={`w-full h-auto p-4 flex flex-col items-center space-y-2 ${selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#C37C00] to-[#E6A500] text-white border-0'
                    : 'text-gray-600 hover:text-[#C37C00] bg-white/80 backdrop-blur-sm'
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

      {/* FAQs */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">الأسئلة الشائعة</h2>
            <p className="text-lg text-gray-600">إجابات على أكثر الأسئلة شيوعاً</p>
          </motion.div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 bg-white/80 backdrop-blur-sm ">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50/50 transition-colors duration-200"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 text-right flex-1">
                        {faq.question}
                      </CardTitle>
                      <div className="ml-4">
                        {expandedFaq === faq.id ? (
                          <ChevronDown className="w-5 h-5 text-amber-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {expandedFaq === faq.id && (
                    <CardContent>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-[#FFF8E6]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">الأدلة الإرشادية</h2>
            <p className="text-lg text-gray-600">أدلة شاملة لمساعدتك في استخدام المنصة</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guides.map((guide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover: transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm cursor-pointer hover:scale-105">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-[#C37C00] to-[#E6A500] rounded-lg flex items-center justify-center mb-4">
                      <Book className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {guide.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4">
                      {guide.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Clock className="w-4 h-4" />
                        <span>{guide.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <CheckCircle className="w-4 h-4" />
                        <span>{guide.steps} خطوات</span>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-[#C37C00] to-[#E6A500] hover:from-[#A66A00] hover:to-[#C37C00] text-white">
                      ابدأ الدليل
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gradient-to-r from-[#C37C00] via-[#E6A500] to-[#A66A00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              لم تجد ما تبحث عنه؟
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              فريق الدعم لدينا متاح 24/7 لمساعدتك في أي استفسار
            </p>
            <Button
              size="lg"
              className="bg-white text-amber-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              تواصل مع الدعم
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;

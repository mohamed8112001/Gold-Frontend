import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { 
  Users, 
  Target, 
  Heart, 
  Shield, 
  Award, 
  Clock,
  MapPin,
  Star,
  Gem,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const AboutUs = () => {
  const features = [
    {
      icon: Clock,
      title: 'توفير الوقت والجهد',
      description: 'نساعد المشترين في العثور على أفضل محلات الذهب بسرعة وسهولة دون الحاجة للبحث الطويل'
    },
    {
      icon: Target,
      title: 'قرارات مدروسة',
      description: 'نوفر معلومات شاملة عن المحلات والمنتجات لمساعدة العملاء في اتخاذ قرارات شراء صحيحة'
    },
    {
      icon: Shield,
      title: 'الثقة والأمان',
      description: 'نضمن التعامل مع محلات موثوقة ومعتمدة مع نظام تقييمات شفاف من العملاء'
    },
    {
      icon: Users,
      title: 'ربط المشترين بالبائعين',
      description: 'نسهل التواصل المباشر بين العملاء وأصحاب المحلات لتجربة شراء أفضل'
    }
  ];

  const stats = [
    { number: '500+', label: 'محل ذهب معتمد', icon: Gem },
    { number: '10,000+', label: 'عميل راضي', icon: Users },
    { number: '4.8/5', label: 'تقييم العملاء', icon: Star },
    { number: '50+', label: 'مدينة مصرية', icon: MapPin }
  ];

  const values = [
    {
      title: 'الشفافية',
      description: 'نؤمن بالشفافية الكاملة في الأسعار والمعلومات',
      icon: CheckCircle
    },
    {
      title: 'الجودة',
      description: 'نضمن أعلى معايير الجودة في المنتجات والخدمات',
      icon: Award
    },
    {
      title: 'الابتكار',
      description: 'نسعى دائماً لتطوير تجربة المستخدم وتحسين خدماتنا',
      icon: TrendingUp
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
              من نحن؟
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              نحن منصة رقمية مبتكرة تهدف إلى تسهيل عملية شراء الذهب والمجوهرات في مصر
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">رسالتنا</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              نسعى لتوفير الجهد على العملاء المشترين للذهب وأصحاب المحلات، ونسهل عليهم اتخاذ القرارات الصحيحة 
              من خلال منصة شاملة تجمع بين الشفافية والثقة والسهولة في الاستخدام
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">أرقامنا تتحدث</h2>
            <p className="text-xl text-white/90">نفخر بثقة عملائنا وشركائنا</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/90 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">قيمنا</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              نؤمن بمجموعة من القيم الأساسية التي توجه عملنا وتحدد هويتنا
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
                  <CardHeader>
                    <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <value.icon className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-lg leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-8">قصتنا</h2>
            <div className="prose prose-lg mx-auto text-gray-600 leading-relaxed">
              <p className="text-xl mb-6">
                بدأت فكرة "دبلة" من تجربة شخصية واجهناها عند البحث عن أفضل محلات الذهب في مصر. 
                لاحظنا أن العملاء يقضون وقتاً طويلاً في البحث والمقارنة، بينما أصحاب المحلات يواجهون صعوبة في الوصول للعملاء المناسبين.
              </p>
              <p className="text-xl mb-6">
                من هنا جاءت فكرة إنشاء منصة رقمية تجمع بين الطرفين، توفر للعملاء معلومات شاملة وموثوقة عن المحلات والمنتجات، 
                وتساعد أصحاب المحلات في عرض منتجاتهم والوصول لعملاء جدد.
              </p>
              <p className="text-xl">
                اليوم، نفخر بكوننا الوجهة الأولى لمحبي الذهب والمجوهرات في مصر، حيث نجمع بين التقنية الحديثة والخبرة التقليدية 
                لنقدم تجربة فريدة ومميزة لجميع عملائنا.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

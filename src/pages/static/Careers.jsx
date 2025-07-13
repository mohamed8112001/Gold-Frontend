import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { 
  Briefcase, 
  MapPin, 
  Clock,
  DollarSign,
  Users,
  Code,
  Palette,
  BarChart3,
  HeadphonesIcon,
  Rocket,
  Heart,
  Coffee,
  Zap,
  Target,
  Award
} from 'lucide-react';
import useScrollToTop from '../../hooks/useScrollToTop';

const Careers = () => {
  // Use scroll to top hook
  useScrollToTop();
  const [selectedJob, setSelectedJob] = useState(null);

  const jobOpenings = [
    {
      id: 1,
      title: 'مطور Frontend React',
      department: 'التطوير',
      location: 'القاهرة، مصر',
      type: 'دوام كامل',
      salary: '15,000 - 25,000 جنيه',
      icon: Code,
      description: 'نبحث عن مطور Frontend محترف للانضمام لفريقنا التقني',
      requirements: [
        'خبرة 3+ سنوات في React.js',
        'إتقان JavaScript, HTML, CSS',
        'خبرة في Tailwind CSS',
        'معرفة بـ Git و GitHub',
        'القدرة على العمل ضمن فريق'
      ],
      responsibilities: [
        'تطوير واجهات المستخدم التفاعلية',
        'تحسين أداء التطبيق',
        'التعاون مع فريق التصميم',
        'كتابة كود نظيف وقابل للصيانة'
      ]
    },
    {
      id: 2,
      title: 'مصمم UI/UX',
      department: 'التصميم',
      location: 'القاهرة، مصر',
      type: 'دوام كامل',
      salary: '12,000 - 20,000 جنيه',
      icon: Palette,
      description: 'مصمم مبدع لتطوير تجربة المستخدم وواجهات التطبيق',
      requirements: [
        'خبرة 2+ سنوات في UI/UX',
        'إتقان Figma, Adobe XD',
        'فهم مبادئ تجربة المستخدم',
        'معرفة بالتصميم المتجاوب',
        'مهارات تواصل ممتازة'
      ],
      responsibilities: [
        'تصميم واجهات المستخدم',
        'إجراء بحوث المستخدمين',
        'إنشاء النماذج الأولية',
        'التعاون مع فريق التطوير'
      ]
    },
    {
      id: 3,
      title: 'مطور Backend Node.js',
      department: 'التطوير',
      location: 'القاهرة، مصر',
      type: 'دوام كامل',
      salary: '18,000 - 28,000 جنيه',
      icon: Code,
      description: 'مطور Backend خبير لبناء وصيانة الخوادم والـ APIs',
      requirements: [
        'خبرة 4+ سنوات في Node.js',
        'إتقان Express.js و MongoDB',
        'معرفة بـ RESTful APIs',
        'خبرة في Docker و AWS',
        'فهم أمان التطبيقات'
      ],
      responsibilities: [
        'تطوير APIs قوية وآمنة',
        'إدارة قواعد البيانات',
        'تحسين أداء الخوادم',
        'ضمان أمان التطبيق'
      ]
    },
    {
      id: 4,
      title: 'أخصائي تسويق رقمي',
      department: 'التسويق',
      location: 'القاهرة، مصر',
      type: 'دوام كامل',
      salary: '10,000 - 18,000 جنيه',
      icon: BarChart3,
      description: 'خبير تسويق رقمي لتنمية قاعدة العملاء وزيادة الوعي بالعلامة التجارية',
      requirements: [
        'خبرة 2+ سنوات في التسويق الرقمي',
        'إتقان Google Ads و Facebook Ads',
        'معرفة بـ SEO و SEM',
        'مهارات تحليل البيانات',
        'إبداع في إنشاء المحتوى'
      ],
      responsibilities: [
        'إدارة حملات التسويق الرقمي',
        'تحليل أداء الحملات',
        'إنشاء محتوى تسويقي',
        'إدارة وسائل التواصل الاجتماعي'
      ]
    },
    {
      id: 5,
      title: 'أخصائي خدمة العملاء',
      department: 'خدمة العملاء',
      location: 'القاهرة، مصر',
      type: 'دوام كامل',
      salary: '8,000 - 12,000 جنيه',
      icon: HeadphonesIcon,
      description: 'متخصص في خدمة العملاء لضمان رضا العملاء وحل مشاكلهم',
      requirements: [
        'خبرة سنة+ في خدمة العملاء',
        'مهارات تواصل ممتازة',
        'صبر وقدرة على حل المشاكل',
        'معرفة أساسية بالحاسوب',
        'إتقان اللغة العربية والإنجليزية'
      ],
      responsibilities: [
        'الرد على استفسارات العملاء',
        'حل مشاكل العملاء',
        'متابعة رضا العملاء',
        'توثيق التفاعلات مع العملاء'
      ]
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'تأمين صحي شامل',
      description: 'تأمين صحي لك ولعائلتك'
    },
    {
      icon: Coffee,
      title: 'بيئة عمل مرنة',
      description: 'إمكانية العمل من المنزل'
    },
    {
      icon: Zap,
      title: 'تطوير مهني',
      description: 'دورات تدريبية ومؤتمرات'
    },
    {
      icon: Target,
      title: 'مكافآت الأداء',
      description: 'مكافآت سنوية حسب الأداء'
    },
    {
      icon: Award,
      title: 'إجازات مدفوعة',
      description: '21 يوم إجازة سنوية'
    },
    {
      icon: Users,
      title: 'فريق متميز',
      description: 'العمل مع أفضل المواهب'
    }
  ];

  const culture = [
    'نؤمن بالابتكار والإبداع',
    'نقدر التوازن بين العمل والحياة',
    'نشجع التعلم المستمر',
    'نحتفل بالنجاحات الجماعية',
    'نؤمن بالشفافية والصدق',
    'نسعى للتميز في كل ما نفعله'
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
              انضم لفريقنا
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              كن جزءاً من رحلتنا لتطوير مستقبل تجارة الذهب في مصر
            </p>
          </motion.div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">ثقافة العمل لدينا</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              نؤمن بخلق بيئة عمل إيجابية ومحفزة تساعد كل فرد على تحقيق أقصى إمكاناته
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {culture.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></div>
                  <p className="text-gray-800 font-medium">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">المزايا والفوائد</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              نقدر موظفينا ونوفر لهم مجموعة شاملة من المزايا والفوائد
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">الوظائف المتاحة</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              اكتشف الفرص الوظيفية المتاحة وانضم لفريقنا المتنامي
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm cursor-pointer hover:scale-105"
                      onClick={() => setSelectedJob(job)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                          <job.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900">
                            {job.title}
                          </CardTitle>
                          <p className="text-amber-600 font-medium">{job.department}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4">
                      {job.description}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <DollarSign className="w-4 h-4" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white">
                      عرض التفاصيل
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              لم تجد الوظيفة المناسبة؟
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              أرسل لنا سيرتك الذاتية وسنتواصل معك عند توفر فرصة مناسبة لمهاراتك
            </p>
            <Button 
              size="lg"
              className="bg-white text-amber-600 hover:bg-gray-100 font-bold px-8 py-3 text-lg"
            >
              <Rocket className="w-5 h-5 mr-2" />
              أرسل سيرتك الذاتية
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Job Details Modal would go here */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                  <p className="text-amber-600 font-medium">{selectedJob.department}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">المتطلبات:</h4>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">المسؤوليات:</h4>
                  <ul className="space-y-2">
                    {selectedJob.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white">
                  تقدم للوظيفة
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Careers;

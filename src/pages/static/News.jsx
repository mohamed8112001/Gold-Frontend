import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { 
  Calendar, 
  Clock, 
  User,
  TrendingUp,
  Newspaper,
  Tag,
  ArrowRight,
  Search,
  Filter,
  Eye,
  Share2
} from 'lucide-react';
import useScrollToTop from '../../hooks/useScrollToTop';

const News = () => {
  // Use scroll to top hook
  useScrollToTop();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'جميع الأخبار', count: 12 },
    { id: 'market', name: 'أسعار الذهب', count: 5 },
    { id: 'platform', name: 'أخبار المنصة', count: 4 },
    { id: 'tips', name: 'نصائح وإرشادات', count: 3 }
  ];

  const newsArticles = [
    {
      id: 1,
      title: 'ارتفاع أسعار الذهب في السوق المصري لأعلى مستوى في 6 أشهر',
      excerpt: 'شهدت أسعار الذهب في السوق المصري ارتفاعاً ملحوظاً خلال الأسبوع الماضي، حيث وصل سعر الجرام عيار 21 إلى مستويات قياسية جديدة...',
      content: 'شهدت أسعار الذهب في السوق المصري ارتفاعاً ملحوظاً خلال الأسبوع الماضي، حيث وصل سعر الجرام عيار 21 إلى مستويات قياسية جديدة. ويعزو خبراء السوق هذا الارتفاع إلى عدة عوامل اقتصادية عالمية ومحلية.',
      category: 'market',
      author: 'أحمد محمد',
      date: '2024-01-15',
      readTime: '5 دقائق',
      views: 1250,
      image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: true
    },
    {
      id: 2,
      title: 'إطلاق ميزة جديدة لحجز المواعيد المباشرة مع محلات الذهب',
      excerpt: 'أعلنت منصة دبلة عن إطلاق ميزة جديدة تتيح للعملاء حجز مواعيد مباشرة مع محلات الذهب المعتمدة على المنصة...',
      content: 'أعلنت منصة دبلة عن إطلاق ميزة جديدة تتيح للعملاء حجز مواعيد مباشرة مع محلات الذهب المعتمدة على المنصة. هذه الميزة تهدف إلى تسهيل عملية التسوق وضمان حصول العملاء على خدمة شخصية مميزة.',
      category: 'platform',
      author: 'فريق دبلة',
      date: '2024-01-12',
      readTime: '3 دقائق',
      views: 890,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: false
    },
    {
      id: 3,
      title: 'نصائح مهمة لشراء الذهب في موسم الأعراس',
      excerpt: 'مع اقتراب موسم الأعراس، يزداد الإقبال على شراء الذهب والمجوهرات. إليك أهم النصائح للحصول على أفضل قيمة...',
      content: 'مع اقتراب موسم الأعراس، يزداد الإقبال على شراء الذهب والمجوهرات. إليك أهم النصائح للحصول على أفضل قيمة مقابل المال والتأكد من جودة المنتجات.',
      category: 'tips',
      author: 'سارة أحمد',
      date: '2024-01-10',
      readTime: '7 دقائق',
      views: 2100,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: false
    },
    {
      id: 4,
      title: 'توقعات خبراء السوق لأسعار الذهب في الربع الأول من 2024',
      excerpt: 'يتوقع خبراء السوق استمرار التقلبات في أسعار الذهب خلال الربع الأول من العام الجديد، مع توقعات بارتفاع تدريجي...',
      content: 'يتوقع خبراء السوق استمرار التقلبات في أسعار الذهب خلال الربع الأول من العام الجديد، مع توقعات بارتفاع تدريجي نتيجة للظروف الاقتصادية العالمية.',
      category: 'market',
      author: 'محمد علي',
      date: '2024-01-08',
      readTime: '6 دقائق',
      views: 1680,
      image: 'https://images.unsplash.com/photo-1611095973362-ee1cd3608ba9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: false
    },
    {
      id: 5,
      title: 'انضمام 50 محل ذهب جديد لمنصة دبلة خلال شهر ديسمبر',
      excerpt: 'شهد شهر ديسمبر الماضي انضمام 50 محل ذهب جديد لمنصة دبلة، مما يرفع العدد الإجمالي للمحلات المعتمدة إلى أكثر من 500 محل...',
      content: 'شهد شهر ديسمبر الماضي انضمام 50 محل ذهب جديد لمنصة دبلة، مما يرفع العدد الإجمالي للمحلات المعتمدة إلى أكثر من 500 محل في جميع أنحاء مصر.',
      category: 'platform',
      author: 'فريق دبلة',
      date: '2024-01-05',
      readTime: '4 دقائق',
      views: 1420,
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: false
    },
    {
      id: 6,
      title: 'كيفية التمييز بين الذهب الأصلي والمقلد: دليل شامل',
      excerpt: 'مع انتشار المنتجات المقلدة في السوق، أصبح من المهم معرفة كيفية التمييز بين الذهب الأصلي والمقلد...',
      content: 'مع انتشار المنتجات المقلدة في السوق، أصبح من المهم معرفة كيفية التمييز بين الذهب الأصلي والمقلد. إليك دليل شامل للتعرف على علامات الجودة.',
      category: 'tips',
      author: 'خالد حسن',
      date: '2024-01-03',
      readTime: '8 دقائق',
      views: 3200,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      featured: false
    }
  ];

  const filteredArticles = newsArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = newsArticles.find(article => article.featured);
  const regularArticles = filteredArticles.filter(article => !article.featured);

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              الأخبار والتحديثات
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              ابق على اطلاع بآخر أخبار سوق الذهب وتحديثات منصة دبلة
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white/50 backdrop-blur-sm border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في الأخبار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white'
                      : 'text-gray-600 hover:text-amber-600'
                  }`}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && selectedCategory === 'all' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden border-0 bg-white/80 backdrop-blur-sm ">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        خبر مميز
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500 mb-4">
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        {getCategoryName(featuredArticle.category)}
                      </span>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(featuredArticle.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Clock className="w-4 h-4" />
                        <span>{featuredArticle.readTime}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      {featuredArticle.title}
                    </h2>
                    
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {featuredArticle.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Button className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white">
                        اقرأ المزيد
                        <ArrowRight className="w-4 h-4 mr-2" />
                      </Button>
                      
                      <div className="flex items-center space-x-4 rtl:space-x-reverse text-gray-500">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Eye className="w-4 h-4" />
                          <span>{featuredArticle.views}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Regular Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full overflow-hidden border-0 bg-white/80 backdrop-blur-sm  hover: transition-all duration-300 cursor-pointer hover:scale-105">
                  <div className="relative h-48">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-amber-600 px-2 py-1 rounded-full text-xs font-medium">
                        {getCategoryName(article.category)}
                      </span>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs text-gray-500 mb-2">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <User className="w-3 h-3" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(article.date)}</span>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                      {article.excerpt}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs text-gray-500">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </div>
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Eye className="w-3 h-3" />
                          <span>{article.views}</span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                        اقرأ المزيد
                        <ArrowRight className="w-3 h-3 mr-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              اشترك في النشرة الإخبارية
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              احصل على آخر الأخبار والتحديثات مباشرة في بريدك الإلكتروني
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button className="bg-white text-amber-600 hover:bg-gray-100 font-bold px-6 py-3">
                اشترك الآن
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default News;

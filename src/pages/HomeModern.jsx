import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
  Search,
  Star,
  MapPin,
  Phone,
  Eye,
  Shield,
  Award,
  Gem,
  Crown,
  Sparkles,
  Heart,
  ShoppingBag,
  Truck,
  Clock
} from 'lucide-react';
import { shopService } from '../services/shopService.js';
import { useAuth } from '@/context/AuthContext.jsx';

const HomeModern = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await shopService.getAllShops();
        setShops(response.data || []);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const filteredShops = shops.filter(shop =>
    shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-gray-50 to-white py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Main Heading */}
          <div className="mb-12">
            <h1 className="h1-bold-56 text-gray-900 mb-6 animate-fade-in">
              اكتشف عالم المجوهرات الفاخرة
            </h1>
            <h2 className="h2-bold-48 text-gray-700 mb-6 animate-fade-in-delay">
              متجرك الأول للذهب والمجوهرات
            </h2>
            <p className="caption-14 text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-delay-2">
              نقدم لك أجمل وأرقى قطع المجوهرات من أفضل المتاجر المعتمدة في مصر.
              تسوق بثقة واستمتع بتجربة فريدة في عالم الجمال والأناقة.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={() => navigate('/shops')}
              className="btn-18 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <Gem className="w-5 h-5 ml-2" />
              استكشف المتاجر
            </Button>

            <Button
              onClick={() => navigate('/products')}
              className="btn-18 bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5 ml-2" />
              تصفح المنتجات
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-8 text-gray-500 opacity-70">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="caption-light-12">آمن ومضمون</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="caption-light-12">جودة عالية</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="caption-light-12">معتمد</span>
            </div>
          </div>
        </div>

        {/* Enhanced Decorative Elements */}
        <div className="absolute top-10 left-10 text-amber-400 opacity-10 animate-float">
          <Crown className="w-20 h-20" />
        </div>
        <div className="absolute bottom-10 right-10 text-yellow-400 opacity-10 animate-float" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-16 h-16" />
        </div>
        <div className="absolute top-1/2 left-5 text-amber-300 opacity-5 animate-float" style={{ animationDelay: '2s' }}>
          <Gem className="w-12 h-12" />
        </div>
        <div className="absolute top-20 right-20 text-yellow-300 opacity-5 animate-float" style={{ animationDelay: '0.5s' }}>
          <Heart className="w-10 h-10" />
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-100 via-transparent to-yellow-100"></div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="h3-bold-42 text-gray-900 mb-4">
              ابحث عن متجرك المفضل
            </h3>
            <p className="caption-14 text-gray-600 max-w-xl mx-auto">
              اكتشف أفضل متاجر المجوهرات والذهب واعثر على ما تبحث عنه بسهولة
            </p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <Input
                type="text"
                placeholder="ابحث عن المتاجر، المجوهرات، الذهب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 text-lg rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-300 shadow-lg hover:shadow-xl bg-white"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 w-6 h-6 transition-colors duration-300" />

              {/* Search Button */}
              <Button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-18 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl transition-all duration-300"
                onClick={() => {
                  if (searchTerm.trim()) {
                    navigate(`/shops?search=${encodeURIComponent(searchTerm)}`);
                  }
                }}
              >
                بحث
              </Button>
            </div>

            {/* Popular Searches */}
            <div className="mt-6 text-center">
              <p className="caption-light-12 text-gray-500 mb-3">البحث الشائع:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['خواتم ذهب', 'قلائد', 'أساور', 'أقراط', 'دبل زفاف'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="caption-14 bg-white border border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-gray-600 hover:text-amber-700 px-4 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="h3-bold-42 text-gray-900 mb-6">
              من نحن
            </h3>
            <h5 className="h5-bold-32 text-gray-700 mb-8">
              رحلتك نحو الجمال والأناقة
            </h5>
            <p className="caption-14 text-gray-600 max-w-3xl mx-auto leading-relaxed">
              نحن منصة رائدة في عالم المجوهرات والذهب، نجمع أفضل المتاجر المعتمدة في مكان واحد.
              نهدف إلى تقديم تجربة تسوق استثنائية تجمع بين الجودة العالية والثقة والأمان.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-amber-500 mb-4">
                <Award className="w-12 h-12 mx-auto" />
              </div>
              <h4 className="h4-bold-36 text-gray-900 mb-2">50+</h4>
              <p className="caption-14 text-gray-600">متجر معتمد</p>
            </div>

            <div className="p-6">
              <div className="text-amber-500 mb-4">
                <Heart className="w-12 h-12 mx-auto" />
              </div>
              <h4 className="h4-bold-36 text-gray-900 mb-2">1000+</h4>
              <p className="caption-14 text-gray-600">عميل راضٍ</p>
            </div>

            <div className="p-6">
              <div className="text-amber-500 mb-4">
                <Star className="w-12 h-12 mx-auto" />
              </div>
              <h4 className="h4-bold-36 text-gray-900 mb-2">4.9</h4>
              <p className="caption-14 text-gray-600">تقييم العملاء</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="h3-bold-42 text-gray-900 mb-8">
              خدماتنا المميزة
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="text-amber-500 mb-4">
                  <Shield className="w-12 h-12 mx-auto" />
                </div>
                <h4 className="h4-bold-36 text-gray-900 mb-4">
                  ضمان الجودة
                </h4>
                <p className="caption-14 text-gray-600">
                  جميع المنتجات معتمدة ومضمونة الجودة مع شهادات أصالة
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="text-amber-500 mb-4">
                  <Truck className="w-12 h-12 mx-auto" />
                </div>
                <h4 className="h4-bold-36 text-gray-900 mb-4">
                  توصيل آمن
                </h4>
                <p className="caption-14 text-gray-600">
                  خدمة توصيل سريعة وآمنة لجميع أنحاء الجمهورية
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="text-amber-500 mb-4">
                  <Clock className="w-12 h-12 mx-auto" />
                </div>
                <h4 className="h4-bold-36 text-gray-900 mb-4">
                  خدمة 24/7
                </h4>
                <p className="caption-14 text-gray-600">
                  فريق دعم متاح على مدار الساعة لخدمتك
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="text-amber-500 mb-4">
                  <Gem className="w-12 h-12 mx-auto" />
                </div>
                <h4 className="h4-bold-36 text-gray-900 mb-4">
                  تشكيلة متنوعة
                </h4>
                <p className="caption-14 text-gray-600">
                  أكبر تشكيلة من المجوهرات والذهب بأفضل الأسعار
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Shops Preview */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="h3-bold-42 text-gray-900 mb-8">
              متاجرنا المميزة
            </h3>
          </div>

          {loading ? (
            <div className="text-center">
              <p className="caption-14 text-gray-600">جاري التحميل...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredShops.slice(0, 6).map((shop) => (
                <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                      <Gem className="w-16 h-16 text-amber-500" />
                    </div>
                    <div className="p-6">
                      <h4 className="h4-bold-36 text-gray-900 mb-2">
                        {shop.name || 'متجر مجوهرات'}
                      </h4>
                      <p className="caption-14 text-gray-600 mb-4">
                        {shop.description || 'متجر متخصص في المجوهرات والذهب'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="caption-14 mr-1">4.8</span>
                        </div>
                        <Button
                          onClick={() => navigate(`/shop/${shop.id}`)}
                          className="btn-18 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
                        >
                          زيارة المتجر
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/shops')}
              className="btn-18 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl"
            >
              عرض جميع المتاجر
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h6 className="h6-bold-28 mb-4">متجر الذهب</h6>
          <p className="caption-light-12 text-gray-400 mb-8">
            منصتك الموثوقة لأفضل المجوهرات والذهب في مصر
          </p>
          <div className="flex justify-center space-x-6 space-x-reverse">
            <p className="caption-light-12 text-gray-400">© 2024 جميع الحقوق محفوظة</p>
            <p className="caption-light-12 text-gray-400">|</p>
            <p className="caption-light-12 text-gray-400">الشروط والأحكام</p>
            <p className="caption-light-12 text-gray-400">|</p>
            <p className="caption-light-12 text-gray-400">سياسة الخصوصية</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeModern;

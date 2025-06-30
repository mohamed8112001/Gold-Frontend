import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* معلومات الشركة */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold">Dibla</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              منصة دبلة تربط العملاء بأفضل محلات المجوهرات في مصر. 
              اكتشف مجموعة رائعة من المجوهرات الذهبية والأحجار الكريمة.
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* روابط سريعة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/stores" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
                  المحلات
                </Link>
              </li>
              <li>
                <Link to="/collections" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
                  المجموعات
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
                  عن دبلة
                </Link>
              </li>
            </ul>
          </div>

          {/* خدمات */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">خدماتنا</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
                  الشروط والأحكام
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">
                  سياسة الإرجاع
                </a>
              </li>
            </ul>
          </div>

          {/* معلومات الاتصال */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300 text-sm">+20 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300 text-sm">info@dibla.com</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300 text-sm">القاهرة، مصر</span>
              </div>
            </div>
          </div>
        </div>

        {/* خط الفصل */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Dibla. جميع الحقوق محفوظة.
            </p>
            <p className="text-gray-400 text-sm flex items-center space-x-1 rtl:space-x-reverse">
              <span>صُنع بـ</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>في مصر</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


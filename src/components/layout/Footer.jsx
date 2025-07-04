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
import { ROUTES } from '../../utils/constants.js';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    company: {
      title: 'الشركة',
      links: [
        { name: 'من نحن', href: '/about' },
        { name: 'اتصل بنا', href: '/contact' },
        { name: 'الوظائف', href: '/careers' },
        { name: 'الأخبار', href: '/news' },
      ],
    },
    support: {
      title: 'الدعم',
      links: [
        { name: 'مركز المساعدة', href: '/help' },
        { name: 'الأسئلة الشائعة', href: '/faq' },
        { name: 'سياسة الخصوصية', href: '/privacy' },
        { name: 'الشروط والأحكام', href: '/terms' },
      ],
    },
    legal: {
      title: 'قانوني',
      links: [
        { name: 'سياسة الإرجاع', href: '/returns' },
        { name: 'سياسة الشحن', href: '/shipping' },
        { name: 'ضمان الجودة', href: '/quality' },
        { name: 'شكاوى العملاء', href: '/complaints' },
      ],
    },
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'serif' }}>
                Dibla
              </span>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              منصة Dibla تربط العملاء بأفضل متاجر الذهب والمجوهرات في مصر. 
              اكتشف مجموعة واسعة من المجوهرات الفاخرة واحجز موعدك بسهولة.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300">
                <Phone className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">+20 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300">
                <Mail className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">info@dibla.com</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300">
                <MapPin className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">القاهرة، مصر</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-lg font-semibold mb-4 text-yellow-500">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-yellow-500 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-md mx-auto text-center lg:text-right lg:mx-0">
            <h3 className="text-lg font-semibold mb-4 text-yellow-500">
              اشترك في النشرة الإخبارية
            </h3>
            <p className="text-gray-300 mb-4 text-sm">
              احصل على آخر الأخبار والعروض الخاصة
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors duration-200 font-medium">
                اشتراك
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 text-sm">
              <span>© {currentYear} Dibla. جميع الحقوق محفوظة.</span>
              <span className="hidden sm:inline">صنع بـ</span>
              <Heart className="w-4 h-4 text-red-500 hidden sm:inline" />
              <span className="hidden sm:inline">في مصر</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <span className="text-gray-400 text-sm ml-4">تابعنا:</span>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


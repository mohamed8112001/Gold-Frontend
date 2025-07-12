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
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900/20 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-400/5 via-yellow-400/3 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-amber-500/8 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-yellow-400/5 to-amber-400/5 rounded-full blur-2xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-xl shadow-amber-500/25 border border-amber-400/20">
                <span className="text-white font-bold text-xl drop-shadow-lg">D</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm" style={{ fontFamily: 'serif' }}>
                Dibla
              </span>
            </div>

            <p className="text-slate-300 mb-8 leading-relaxed text-sm">
              منصة Dibla تربط العملاء بأفضل متاجر الذهب والمجوهرات في مصر.
              اكتشف مجموعة واسعة من المجوهرات الفاخرة واحجز موعدك بسهولة.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-slate-300 group hover:text-amber-300 transition-all duration-300">
                <div className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-yellow-600 transition-all duration-300 border border-slate-700 group-hover:border-amber-400/50">
                  <Phone className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium">+20 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-slate-300 group hover:text-amber-300 transition-all duration-300">
                <div className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-yellow-600 transition-all duration-300 border border-slate-700 group-hover:border-amber-400/50">
                  <Mail className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium">info@dibla.com</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-slate-300 group hover:text-amber-300 transition-all duration-300">
                <div className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-yellow-600 transition-all duration-300 border border-slate-700 group-hover:border-amber-400/50">
                  <MapPin className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium">القاهرة، مصر</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="space-y-6">
              <h3 className="text-lg font-bold mb-6 text-white relative">
                {section.title}
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-slate-300 hover:text-amber-300 transition-all duration-300 text-sm font-medium hover:translate-x-2 rtl:hover:-translate-x-2 inline-block group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-slate-700/50 mt-16 pt-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-amber-900/20 backdrop-blur-sm rounded-2xl p-8 border border-amber-400/20 shadow-2xl shadow-amber-500/10">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                اشترك في النشرة الإخبارية
              </h3>
              <p className="text-slate-300 mb-8 text-sm leading-relaxed">
                احصل على آخر الأخبار والعروض الخاصة والمجوهرات الجديدة مباشرة في بريدك الإلكتروني
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  className="flex-1 px-6 py-3 bg-slate-900/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 backdrop-blur-sm"
                />
                <button className="px-8 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-amber-500/30 transform hover:scale-105 hover:-translate-y-0.5">
                  اشتراك
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-700/50 bg-slate-900/60 backdrop-blur-sm">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-slate-400 text-sm">
              <span className="font-medium">© {currentYear} Dibla. جميع الحقوق محفوظة.</span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
                <span>صنع بـ</span>
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                <span>في مصر</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <span className="text-slate-400 text-sm font-medium">تابعنا:</span>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-11 h-11 bg-slate-800/60 hover:bg-gradient-to-br hover:from-amber-500 hover:via-yellow-500 hover:to-amber-600 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-amber-500/30 border border-slate-700 hover:border-amber-400/50 backdrop-blur-sm"
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
      </div>
    </footer>
  );
};

export default Footer;


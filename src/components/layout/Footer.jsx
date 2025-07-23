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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const footerSections = {
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Careers', href: '/careers' },
        { name: 'News', href: '/news' },
      ],
    },
    support: {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms & Conditions', href: '/terms' },
      ],
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Return Policy', href: '/returns' },
        { name: 'Shipping Policy', href: '/shipping' },
        { name: 'Quality Guarantee', href: '/quality' },
        { name: 'Customer Complaints', href: '/complaints' },
      ],
    },
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
  ];

  return (
    <footer className="bg-black text-white relative font-cairo">
      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center border border-primary-600">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold text-white font-cairo">
                Dibla
              </span>
            </div>

            <p className="text-gray-300 mb-4 leading-relaxed text-sm">
              Dibla is a platform that connects customers with the best gold and jewelry stores in Egypt. Explore a wide range of luxurious jewelry and easily book your appointment.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300 group hover:text-white transition-all duration-300">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-all duration-300 border border-gray-700">
                  <Phone className="w-3 h-3 text-gray-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium">+20 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300 group hover:text-white transition-all duration-300">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-all duration-300 border border-gray-700">
                  <Mail className="w-3 h-3 text-gray-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium">info@dibla.com</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300 group hover:text-white transition-all duration-300">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-all duration-300 border border-gray-700">
                  <MapPin className="w-3 h-3 text-gray-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-sm font-medium">Cairo, Egypt</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="space-y-3">
              <h3 className="text-base font-bold mb-3 text-white relative">
                {section.title}
                <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gray-600 rounded-full"></div>
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      onClick={scrollToTop}
                      className="text-gray-300 hover:text-white transition-all duration-300 text-sm font-medium hover:translate-x-2 rtl:hover:-translate-x-2 inline-block group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 mt-6">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-gray-300 text-sm">
              <span className="font-medium">© {currentYear} Dibla. All rights reserved.</span>
              <span className="hidden sm:inline text-gray-400">•</span>
              <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                <span>in Egypt</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <span className="text-gray-300 text-sm font-medium">Follow us:</span>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-9 h-9 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 border border-gray-700"
                      aria-label={social.name}
                    >
                      <Icon className="w-4 h-4" />
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

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Send,
  Star,
  ThumbsUp,
  Headphones
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useScrollToTop from '../../hooks/useScrollToTop';

const CustomerComplaints = () => {
  // Use scroll to top hook
  useScrollToTop();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    complaintType: '',
    orderNumber: '',
    description: '',
    priority: 'medium'
  });

  const complaintTypes = [
    'جودة المنتج',
    'خدمة العملاء',
    'الشحن والتوصيل',
    'الفوترة والدفع',
    'الموقع الإلكتروني',
    'أخرى'
  ];

  const responseTime = [
    {
      type: 'عاجل',
      time: '24 ساعة',
      description: 'للشكاوى العاجلة والمشاكل الحرجة',
      color: 'text-red-600'
    },
    {
      type: 'عادي',
      time: '48 ساعة',
      description: 'للشكاوى العادية والاستفسارات',
      color: 'text-yellow-600'
    },
    {
      type: 'غير عاجل',
      time: '72 ساعة',
      description: 'للاقتراحات والملاحظات العامة',
      color: 'text-green-600'
    }
  ];

  const complaintProcess = [
    {
      step: 1,
      title: 'تقديم الشكوى',
      description: 'املأ النموذج أو اتصل بخدمة العملاء'
    },
    {
      step: 2,
      title: 'المراجعة والتحليل',
      description: 'سيتم مراجعة شكواك وتحليل المشكلة'
    },
    {
      step: 3,
      title: 'التحقيق والحل',
      description: 'سنقوم بالتحقيق وإيجاد الحل المناسب'
    },
    {
      step: 4,
      title: 'المتابعة والإغلاق',
      description: 'سنتابع معك حتى التأكد من حل المشكلة'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Complaint submitted:', formData);
    alert('تم تقديم شكواك بنجاح. سنتواصل معك قريباً.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-red-600 via-pink-500 to-red-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <MessageSquare className="w-16 h-16 text-white/90" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              شكاوى ومقترحات العملاء
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              نحن نهتم برأيك وملاحظاتك. ساعدنا في تحسين خدماتنا من خلال مشاركة تجربتك
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
            <Link to="/" className="text-gray-500 hover:text-red-600 transition-colors">
              الرئيسية
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-red-600 font-medium">شكاوى العملاء</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-16"
          >
            {/* Response Time */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                أوقات الاستجابة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {responseTime.map((time, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center mb-4">
                      <Clock className={`w-6 h-6 ${time.color} ml-2`} />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {time.type}
                      </h3>
                    </div>
                    <div className={`text-2xl font-bold ${time.color} mb-2`}>
                      {time.time}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {time.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Complaint Process */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                عملية معالجة الشكاوى
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {complaintProcess.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4 text-white font-bold text-lg">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Complaint Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="text-center mb-8">
                <FileText className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  نموذج الشكاوى والمقترحات
                </h2>
                <p className="text-gray-600">
                  املأ النموذج التالي وسنتواصل معك في أقرب وقت ممكن
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني *
                    </label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="أدخل بريدك الإلكتروني"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="أدخل رقم هاتفك"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الشكوى *
                    </label>
                    <select
                      name="complaintType"
                      value={formData.complaintType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">اختر نوع الشكوى</option>
                      {complaintTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الطلب (إن وجد)
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="أدخل رقم الطلب"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأولوية
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="low">غير عاجل</option>
                      <option value="medium">عادي</option>
                      <option value="high">عاجل</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تفاصيل الشكوى أو المقترح *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="اكتب تفاصيل شكواك أو مقترحك هنا..."
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Send className="w-5 h-5 ml-2" />
                    إرسال الشكوى
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <Phone className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  الهاتف
                </h3>
                <p className="text-gray-600 mb-3">متاح 24/7</p>
                <p className="text-red-600 font-semibold">+20 123 456 7890</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <Mail className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  البريد الإلكتروني
                </h3>
                <p className="text-gray-600 mb-3">استجابة خلال 24 ساعة</p>
                <p className="text-red-600 font-semibold">complaints@dibla.com</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <Headphones className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  الدردشة المباشرة
                </h3>
                <p className="text-gray-600 mb-3">متاح من 9 ص إلى 9 م</p>
                <button className="text-red-600 font-semibold hover:text-red-700">
                  ابدأ المحادثة
                </button>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-gray-500 text-sm">
              <p>آخر تحديث: يناير 2024</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CustomerComplaints;

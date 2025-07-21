import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { ArrowLeft, User, Eye, EyeOff, Phone, Mail, Lock, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import { GoogleLogin } from '@react-oauth/google';


const Register = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'regular';
  const navigate = useNavigate();
  const { register, isLoading, googleRegister } = useAuth();


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slider images - in a real app, these would be imported or from a CDN
  const sliderImages = [
    'data:image/jpeg;base64,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',
    'data:image/jpeg;base64,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',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsqxqQGx3hTpJDlsUXKjdvqtPGM1KRlZlsKQ&s'
  ];

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'الاسم الأخير مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^01[0-2,5]{1}[0-9]{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'يجب الموافقة على الشروط والأحكام';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: userType
      });
      navigate(ROUTES.LOGIN);
    } catch (error) {
      setErrors({ submit: error.message || 'حدث خطأ أثناء التسجيل' });
    }
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  const getUserTypeInfo = () => {
    return userType === 'seller'
      ? { title: 'Shop Owner', titleAr: ' Shop Owner', icon: '🏪' }
      : { title: 'Regular User', titleAr: ' Regular User', icon: '👤' };
  };



  const typeInfo = getUserTypeInfo();

  return (
    <div className="h-screen w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8F4ED 0%, #FFFFFF 50%, #F0E8DB 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(163, 127, 65, 0.15) 0%, rgba(163, 127, 65, 0.1) 100%)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{ background: 'linear-gradient(135deg, rgba(163, 127, 65, 0.1) 0%, rgba(163, 127, 65, 0.15) 100%)' }}></div>
      </div>

      <div className="w-full h-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch h-full bg-white/80 backdrop-blur-sm">

          {/* Left Side - Enhanced Branding with Slider */}
          <div className="relative flex flex-col items-center justify-center p-12 overflow-hidden" style={{ background: 'linear-gradient(135deg, #A37F41 0%, #B8904F 50%, #C9A05D 100%)' }}>
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            {/* Image Slider Container */}
            <div className="relative w-80 h-80 mb-12">
              {/* Main circular container */}
              <div className="w-full h-full rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden border-8 border-white/50" style={{ background: 'linear-gradient(135deg, #FEF7ED 0%, #FDF4E8 100%)' }}>
                {/* Slider images */}
                <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-lg">
                  {sliderImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Wedding Ring ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out transform ${index === currentSlide
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-110'
                        }`}
                    />
                  ))}


                </div>

                {/* Floating decorative rings */}
                <div className="absolute top-4 right-4 w-8 h-8 border-4 rounded-full animate-bounce delay-300" style={{ borderColor: 'rgba(163, 127, 65, 0.6)' }}></div>
                <div className="absolute bottom-6 left-6 w-6 h-6 border-3 rounded-full animate-bounce delay-700" style={{ borderColor: 'rgba(163, 127, 65, 0.4)' }}></div>
              </div>
            </div>

            {/* Enhanced Dibla text with animation */}
            <h1 className="text-7xl font-bold mb-8 relative" style={{ fontFamily: 'serif', color: '#2D1810' }}>
              <span className="relative z-10">
                ديبلا
              </span>
              <div className="absolute inset-0 blur-lg opacity-30 animate-pulse" style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #F4E4BC 100%)' }}></div>
            </h1>

            {/* Enhanced subtitle */}
            <p className="text-xl text-center mb-12 max-w-sm leading-relaxed font-medium" style={{ color: '#2D1810' }}>
              اختر أقرب متجر بنقرة واحدة
            </p>

            {/* Enhanced pagination dots */}
            <div className="flex justify-center space-x-3">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 rounded-full ${index === currentSlide
                    ? 'w-10 h-4'
                    : 'w-4 h-4 hover:opacity-80'
                    }`}
                  style={{
                    backgroundColor: index === currentSlide ? '#2D1810' : 'rgba(45, 24, 16, 0.4)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Enhanced Form */}
          <div className="w-full bg-gradient-to-br from-white to-[#FFF8E6] p-8 lg:p-12 flex flex-col justify-start relative overflow-y-auto">
            {/* Navigation */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate(ROUTES.USER_TYPE_SELECTION)}
                className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>العودة لنوع الحساب</span>
              </Button>

              <div className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full shadow-sm" style={{ backgroundColor: '#F5F1EB' }}>
                <User className="w-4 h-4" style={{ color: '#A37F41' }} />
                <span className="text-sm font-medium" style={{ color: '#6B5B47' }}>{typeInfo.titleAr}</span>
              </div>
            </div>

            {/* Navigation Tabs with enhanced styling */}
            <div className="flex justify-center mb-8">
              <div className="flex rounded-xl p-1 shadow-lg" style={{ backgroundColor: '#F0E8DB' }}>
                <div className="px-8 py-3 bg-white rounded-lg font-medium shadow-md border transform scale-105" style={{ color: '#A37F41', borderColor: '#E2D2B6' }}>
                  إنشاء حساب
                </div>
                <Link
                  to={ROUTES.LOGIN}
                  className="px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-white/50"
                  style={{ color: '#241C0F' }}
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>

            <div className="max-w-md mx-auto w-full">
              {/* Enhanced Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-3" style={{ color: '#A37F41' }}>
                  إنشاء حساب
                </h2>
                <p className="text-lg" style={{ color: '#6B5B47' }}>
                  انضم إلى مجتمع ديبلا واكتشف المجوهرات الرائعة
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#6B5B47' }}>
                      الاسم الأول *
                    </label>
                    <Input
                      name="firstName"
                      type="text"
                      placeholder="الاسم الأول"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`py-3 border-2 rounded-xl transition-all duration-200 ${errors.firstName ? 'border-red-500' : ''}`}
                      style={{
                        borderColor: errors.firstName ? '#ef4444' : '#E5D5C3',
                        color: '#6B5B47'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#A37F41'}
                      onBlur={(e) => e.target.style.borderColor = '#E5D5C3'}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#6B5B47' }}>
                      الاسم الأخير *
                    </label>
                    <Input
                      name="lastName"
                      type="text"
                      placeholder="الاسم الأخير"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`py-3 border-2 rounded-xl transition-all duration-200 ${errors.lastName ? 'border-red-500' : ''}`}
                      style={{
                        borderColor: errors.lastName ? '#ef4444' : '#E5D5C3',
                        color: '#6B5B47'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#A37F41'}
                      onBlur={(e) => e.target.style.borderColor = '#E5D5C3'}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Enhanced Email Field */}
                <div className="group">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#6B5B47' }}>
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: '#A37F41' }} />
                    <Input
                      name="email"
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-14 py-4 border-2 rounded-xl transition-all duration-200 ${errors.email ? 'border-red-500' : ''}`}
                      style={{
                        borderColor: errors.email ? '#ef4444' : '#E5D5C3',
                        color: '#6B5B47'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#A37F41'}
                      onBlur={(e) => e.target.style.borderColor = '#E2D2B6'}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2 animate-pulse">{errors.email}</p>
                  )}
                </div>

                {/* Enhanced Phone Field */}
                <div className="group">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#6B5B47' }}>
                    رقم الهاتف *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: '#A37F41' }} />
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`pl-14 py-4 border-2 rounded-xl transition-all duration-200 ${errors.phone ? 'border-red-500' : ''}`}
                      style={{
                        borderColor: errors.phone ? '#ef4444' : '#E5D5C3',
                        color: '#6B5B47'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#A37F41'}
                      onBlur={(e) => e.target.style.borderColor = '#E2D2B6'}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-2 animate-pulse">{errors.phone}</p>
                  )}
                </div>

                {/* Enhanced Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#6B5B47' }}>
                      كلمة المرور *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: '#A37F41' }} />
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="كلمة المرور"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`pl-14 pr-14 py-4 border-2 rounded-xl transition-all duration-200 ${errors.password ? 'border-red-500' : ''}`}
                        style={{
                          borderColor: errors.password ? '#ef4444' : '#E5D5C3',
                          color: '#6B5B47'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#A37F41'}
                        onBlur={(e) => e.target.style.borderColor = '#E5D5C3'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
                        style={{ color: '#A37F41' }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.password}</p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#241C0F' }}>
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors" style={{ color: '#A37F41' }} />
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="تأكيد كلمة المرور"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-14 pr-14 py-4 border-2 rounded-xl transition-all duration-200 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        style={{
                          borderColor: errors.confirmPassword ? '#B54A35' : '#E2D2B6',
                          color: '#241C0F'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#A37F41'}
                        onBlur={(e) => e.target.style.borderColor = '#E5D5C3'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors"
                        style={{ color: '#A37F41' }}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1 animate-pulse">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Enhanced Terms Agreement */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 rounded-lg focus:ring-2"
                    style={{
                      accentColor: '#A37F41',
                      borderColor: '#E5D5C3'
                    }}
                  />
                  <label className="text-sm font-medium" style={{ color: '#6B5B47' }}>
                    أوافق على{' '}
                    <Link to="/terms" className="underline decoration-2 underline-offset-2 hover:opacity-80" style={{ color: '#A37F41' }}>
                      الشروط والأحكام
                    </Link>
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-red-500 text-sm animate-pulse">{errors.agreeToTerms}</p>
                )}

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                    <p className="text-red-600 text-sm font-medium">{errors.submit}</p>
                  </div>
                )}

                {/* Enhanced Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white py-5 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #A37F41 0%, #B8904F 50%, #C9A05D 100%)',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #8B6A35 0%, #A37F41 50%, #B8904F 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #A37F41 0%, #B8904F 50%, #C9A05D 100%)';
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري إنشاء الحساب...</span>
                    </div>
                  ) : (
                    'إنشاء حساب'
                  )}
                </Button>

                {/* Enhanced Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2" style={{ borderColor: '#E5D5C3' }}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-6 bg-gradient-to-r from-[#FFF8E6] to-white font-medium" style={{ color: '#8A5700' }}>أو إنشاء حساب بـ</span>
                  </div>
                </div>

                {/* Enhanced Social Login */}
                <div className="grid grid-cols-1 gap-4">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        await googleRegister(credentialResponse, userType);
                        console.log('Google login success');

                        navigate(ROUTES.HOME);
                      } catch (error) {
                        console.error('Google login error:', error);
                      }
                    }}
                    onError={() => {
                      console.error('Google login failed');
                    }}
                    className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.20-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.60 3.30-4.53 6.16-4.53z" />
                    </svg>
                    <span>انشاء حساب بـ Google</span>
                  </GoogleLogin>
                </div>

                {/* Enhanced Sign In Link */}
                <div className="text-center mt-6">
                  <span className="text-gray-600">لديك حساب بالفعل؟ </span>
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-amber-600 hover:text-amber-700 font-semibold underline decoration-2 underline-offset-2 hover:decoration-amber-700 transition-all duration-200"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Register;
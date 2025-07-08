import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { ArrowLeft, User, Eye, EyeOff, Phone, Mail, Lock, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const Register = () => {
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'regular';
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
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

      // توجيه المستخدمين بناءً على نوع الحساب
      if (userType === 'seller') {
        // أصحاب المحلات يذهبون إلى صفحة تسجيل الدخول
        navigate(ROUTES.LOGIN);
      } else {
        // المستخدمون العاديون يذهبون إلى الصفحة الرئيسية
        navigate(ROUTES.HOME);
      }
    } catch (error) {
      setErrors({ submit: error.message || 'حدث خطأ أثناء التسجيل' });
    }
  };

  const getUserTypeInfo = () => {
    return userType === 'seller'
      ? { title: 'Shop Owner', titleAr: 'صاحب متجر', icon: '🏪' }
      : { title: 'Regular User', titleAr: 'مستخدم عادي', icon: '👤' };
  };

  const typeInfo = getUserTypeInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block">
            <div className="text-center">
              <div className="w-32 h-32 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-4xl font-bold text-white">Dibla</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                No need to leave home —
              </h1>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                compare and book your visit online.
              </h2>
              
              {/* Pagination dots */}
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-800 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full">
            {/* Navigation */}
            <div className="flex justify-between items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate(ROUTES.USER_TYPE_SELECTION)}
                className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back To Account Type</span>
              </Button>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse bg-yellow-100 px-3 py-1 rounded-full">
                <User className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">{typeInfo.titleAr}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <div className="px-6 py-2 bg-yellow-100 text-yellow-800 rounded-md font-medium">
                  Sign Up
                </div>
                <Link 
                  to={ROUTES.LOGIN}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 rounded-md font-medium transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                <CardDescription>
                  Join The Dibla Community And Discover Exquisite Jewelry
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <Input
                        name="firstName"
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <Input
                        name="lastName"
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-Mail *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="Enter Your Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <label className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-yellow-600 hover:text-yellow-700 underline">
                        terms
                      </Link>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>
                  )}

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 text-lg font-medium"
                  >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </Button>

                  {/* Sign In Link */}
                  <div className="text-center">
                    <span className="text-gray-600">Already have account? </span>
                    <Link 
                      to={ROUTES.LOGIN}
                      className="text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Sign in
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


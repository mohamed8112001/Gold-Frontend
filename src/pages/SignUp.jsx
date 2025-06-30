import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStores } from '../context/StoresContext';

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState('userType'); // userType, form
  const [selectedUserType, setSelectedUserType] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    specialties: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { addStore } = useStores();
  const navigate = useNavigate();

  const handleUserTypeSelect = (type) => {
    setSelectedUserType(type);
    setCurrentStep('form');
  };

  const handleBackToUserType = () => {
    setCurrentStep('userType');
    setSelectedUserType('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // إزالة رسالة الخطأ عند بدء الكتابة
    if (error) setError('');
  };

  const handleStoreInputChange = (e) => {
    const { name, value } = e.target;
    setStoreData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('يرجى إدخال الاسم الأول');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('يرجى إدخال الاسم الأخير');
      return false;
    }
    if (!formData.email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('يرجى إدخال رقم الهاتف');
      return false;
    }
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتان');
      return false;
    }
    if (!agreeToTerms) {
      setError('يرجى الموافقة على الشروط والأحكام');
      return false;
    }
    
    // التحقق من بيانات المحل إذا كان المستخدم صاحب محل
    if (selectedUserType === 'store-owner') {
      if (!storeData.name.trim()) {
        setError('يرجى إدخال اسم المحل');
        return false;
      }
      if (!storeData.description.trim()) {
        setError('يرجى إدخال وصف المحل');
        return false;
      }
      if (!storeData.location.trim()) {
        setError('يرجى إدخال موقع المحل');
        return false;
      }
      if (!storeData.phone.trim()) {
        setError('يرجى إدخال رقم هاتف المحل');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const userData = {
        ...formData,
        userType: selectedUserType
      };

      const result = await register(userData);
      
      if (result.success) {
        // إذا كان المستخدم صاحب محل، إنشاء محل له
        if (selectedUserType === 'store-owner') {
          const newStoreData = {
            ...storeData,
            ownerId: result.user.id,
            image: '/store1.jpg', // صورة افتراضية
            specialties: ['مجوهرات ذهبية', 'خواتم', 'أساور', 'قلائد']
          };
          addStore(newStoreData);
        }
        
        // توجيه المستخدم حسب نوعه
        const redirectPath = result.user.userType === 'store-owner' 
          ? '/dashboard/store-owner' 
          : '/dashboard/user';
        
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // صفحة اختيار نوع الحساب
  if (currentStep === 'userType') {
    return (
      <div className="min-h-screen flex">
        {/* الجانب الأيسر - النموذج */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-2xl space-y-8">
            {/* التبديل بين تسجيل الدخول والتسجيل */}
            <div className="flex border-b border-gray-200">
              <button className="flex-1 py-3 text-center text-gray-900 border-b-2 border-amber-600 font-medium">
                Sign Up
              </button>
              <Link
                to="/signin"
                className="flex-1 py-3 text-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* العنوان */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
              <p className="text-gray-600">Join The Dibla Community And Discover Exquisite Jewelry</p>
            </div>

            {/* اختيار نوع الحساب */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center text-gray-900">Choose Your Account Type</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* مستخدم عادي */}
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-amber-200"
                  onClick={() => handleUserTypeSelect('user')}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Regular User</h3>
                      <p className="text-sm text-gray-600 mt-1">Browse and explore gold shops</p>
                    </div>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Check className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-600">Browse jewelry collections</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Check className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-600">Save favorite items</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Check className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-600">Compare prices</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Check className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-600">Read reviews</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* صاحب محل */}
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-amber-200"
                  onClick={() => handleUserTypeSelect('store-owner')}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Shop Owner</h3>
                      <p className="text-sm text-gray-600 mt-1">Register Your Jewelry Store</p>
                    </div>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Check className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-600">Manage your jewelry store</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Check className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-600">Upload product catalog</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Check className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-600">Track analytics</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Check className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-gray-600">Customer management</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن - الصورة والنص */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-amber-100 to-orange-200 items-center justify-center p-8">
          <div className="max-w-md text-center space-y-6">
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center mx-auto">
                <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaTJ7ofFqFJQdbsywWniVRRA-qR0Xe8JpjLg&s"
                    alt="Gold Jewelry"
                    className="w-48 h-48 object-cover rounded-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>
                Dibla
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                No need to leave home — compare and book your visit online.
              </p>
              
              {/* نقاط التنقل */}
              <div className="flex justify-center space-x-2 rtl:space-x-reverse pt-4">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // صفحة النموذج
  return (
    <div className="min-h-screen flex">
      {/* الجانب الأيسر - النموذج */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* التبديل بين تسجيل الدخول والتسجيل */}
          <div className="flex border-b border-gray-200">
            <button className="flex-1 py-3 text-center text-gray-900 border-b-2 border-amber-600 font-medium">
              Sign Up
            </button>
            <Link
              to="/signin"
              className="flex-1 py-3 text-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* زر العودة ونوع الحساب */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              onClick={handleBackToUserType}
              className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back To Account Type</span>
            </button>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-amber-600">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">
                {selectedUserType === 'user' ? 'Regular User' : 'Shop Owner'}
              </span>
            </div>
          </div>

          {/* العنوان */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-600">Join The Dibla Community And Discover Exquisite Jewelry</p>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* النموذج */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* الاسم الأول والأخير */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="First Name*"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Last Name*"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  name="email"
                  placeholder="E-Mail *"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Additional text for more information</p>
            </div>

            {/* رقم الهاتف */}
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Phone *"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Additional text for more information</p>
            </div>

            {/* كلمة المرور */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password *"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Additional text for more information</p>
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password *"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Additional text for more information</p>
              </div>
            </div>

            {/* حقول بيانات المحل - تظهر فقط لأصحاب المحلات */}
            {selectedUserType === 'store-owner' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">بيانات المحل</h3>
                
                {/* اسم المحل */}
                <div>
                  <Input
                    type="text"
                    name="name"
                    placeholder="اسم المحل *"
                    value={storeData.name}
                    onChange={handleStoreInputChange}
                    className="h-12"
                    required
                  />
                </div>

                {/* وصف المحل */}
                <div>
                  <textarea
                    name="description"
                    placeholder="وصف المحل *"
                    value={storeData.description}
                    onChange={handleStoreInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 h-20 resize-none"
                    required
                  />
                </div>

                {/* موقع المحل */}
                <div>
                  <Input
                    type="text"
                    name="location"
                    placeholder="موقع المحل *"
                    value={storeData.location}
                    onChange={handleStoreInputChange}
                    className="h-12"
                    required
                  />
                </div>

                {/* رقم هاتف المحل */}
                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="رقم هاتف المحل *"
                      value={storeData.phone}
                      onChange={handleStoreInputChange}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* الموافقة على الشروط */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the terms
              </label>
            </div>

            {/* رابط تسجيل الدخول */}
            <p className="text-center text-sm text-gray-600">
              Already have account{' '}
              <Link to="/signin" className="text-amber-600 hover:text-amber-700 font-medium">
                Sign in
              </Link>
            </p>

            {/* زر التسجيل */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              {isLoading ? 'جاري إنشاء الحساب...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>

      {/* الجانب الأيمن - الصورة والنص */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-amber-100 to-orange-200 items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="relative">
            <div className="w-80 h-80 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center mx-auto">
              <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-lg">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaTJ7ofFqFJQdbsywWniVRRA-qR0Xe8JpjLg&s"
                  alt="Gold Jewelry"
                  className="w-48 h-48 object-cover rounded-full"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>
              Dibla
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              No need to leave home — compare and book your visit online.
            </p>
            
            {/* نقاط التنقل */}
            <div className="flex justify-center space-x-2 rtl:space-x-reverse pt-4">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;


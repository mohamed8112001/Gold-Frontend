import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // إزالة رسالة الخطأ عند بدء الكتابة
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // توجيه المستخدم حسب نوعه
        const redirectPath = result.user.userType === 'store-owner' 
          ? '/dashboard/store-owner' 
          : from === '/' ? '/dashboard/user' : from;
        
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

  const handleGoogleSignIn = () => {
    // محاكاة تسجيل الدخول بـ Google
    setError('تسجيل الدخول بـ Google غير متاح حالياً في النسخة التجريبية');
  };

  const handleFacebookSignIn = () => {
    // محاكاة تسجيل الدخول بـ Facebook
    setError('تسجيل الدخول بـ Facebook غير متاح حالياً في النسخة التجريبية');
  };

  return (
    <div className="min-h-screen flex">
      {/* الجانب الأيسر - النموذج */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* التبديل بين تسجيل الدخول والتسجيل */}
          <div className="flex border-b border-gray-200">
            <Link
              to="/signup"
              className="flex-1 py-3 text-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign Up
            </Link>
            <button className="flex-1 py-3 text-center text-gray-900 border-b-2 border-amber-600 font-medium">
              Sign In
            </button>
          </div>

          {/* العنوان */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
            <p className="text-gray-600">Please Enter Your Credentials To Access Your Account</p>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* النموذج */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* البريد الإلكتروني */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Enter Your Email</label>
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
            </div>

            {/* كلمة المرور */}
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Enter Your Password</label>
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
            </div>

            {/* تذكرني ونسيت كلمة المرور */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">
                Forget Password?
              </Link>
            </div>

            {/* زر تسجيل الدخول */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'Sign In'}
            </Button>
          </form>

          {/* أو تسجيل الدخول بـ */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or Sign In With</span>
            </div>
          </div>

          {/* أزرار تسجيل الدخول الاجتماعي */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="h-12 flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleFacebookSignIn}
              className="h-12 flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </Button>
          </div>

          {/* رابط إنشاء حساب */}
          <p className="text-center text-sm text-gray-600">
            Don't Have Account?{' '}
            <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-medium">
              Sign Up
            </Link>
          </p>
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
              Choose the nearest shop in just a click.
            </p>
            
            {/* نقاط التنقل */}
            <div className="flex justify-center space-x-2 rtl:space-x-reverse pt-4">
              <div className="w-3 h-3 bg-gray-900 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;


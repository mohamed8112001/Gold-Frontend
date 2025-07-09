import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login,googleLogin, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
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
      await login(formData);
      navigate(ROUTES.HOME);
    } catch (error) {
      setErrors({ submit: error.message || 'حدث خطأ أثناء تسجيل الدخول' });
    }
  };

  const handleGoogleLogin = () => {
    // Google login functionality would be implemented here
    console.log('Google login clicked');
  };

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
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Choose the nearest shop in just a click.
              </h1>

              {/* Pagination dots */}
              <div className="flex justify-center space-x-2">
                <div className="w-8 h-2 bg-gray-800 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full">
            {/* Navigation Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <Link
                  to={ROUTES.USER_TYPE_SELECTION}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900 rounded-md font-medium transition-colors"
                >
                  Sign Up
                </Link>
                <div className="px-6 py-2 bg-yellow-100 text-yellow-800 rounded-md font-medium">
                  Sign In
                </div>
              </div>
            </div>

            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
                <CardDescription>
                  Please Enter Your Credentials To Access Your Account
                </CardDescription>

                {/* Success Message */}
                {successMessage && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">
                      {successMessage}
                    </p>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Your Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="email"
                        type="email"
                        placeholder="E-Mail *"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Your Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password *"
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

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <label className="text-sm text-gray-600">
                        Remember me
                      </label>
                    </div>

                    <Link
                      to={ROUTES.FORGOT_PASSWORD}
                      className="text-sm text-yellow-600 hover:text-yellow-700"
                    >
                      Forget Password?
                    </Link>
                  </div>

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
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or Sign In With</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="w-full">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        try {
                          await googleLogin(credentialResponse);
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
                      <span>تسجيل الدخول بـ Google</span>
                    </GoogleLogin>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center">
                    <span className="text-gray-600">Don't Have Account? </span>
                    <Link
                      to={ROUTES.USER_TYPE_SELECTION}
                      className="text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Sign Up
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

export default Login;


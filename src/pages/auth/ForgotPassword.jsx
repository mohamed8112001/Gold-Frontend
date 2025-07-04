import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { ROUTES } from '../../utils/constants.js';
import { authService } from '../../services/authService.js';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('البريد الإلكتروني مطلوب');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('البريد الإلكتروني غير صحيح');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء إرسال رابط الاستعادة');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                تم الإرسال بنجاح
              </CardTitle>
              <CardDescription>
                تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  يرجى فحص بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور
                </p>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(ROUTES.LOGIN)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    العودة لتسجيل الدخول
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                    className="w-full"
                  >
                    إرسال مرة أخرى
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>العودة لتسجيل الدخول</span>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold">نسيت كلمة المرور؟</CardTitle>
            <CardDescription>
              أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={`pl-10 ${error ? 'border-red-500' : ''}`}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 text-lg font-medium"
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </Button>

              {/* Back to Login */}
              <div className="text-center">
                <span className="text-gray-600">تذكرت كلمة المرور؟ </span>
                <Link 
                  to={ROUTES.LOGIN}
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;


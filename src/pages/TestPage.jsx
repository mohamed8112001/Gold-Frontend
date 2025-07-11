import React from 'react';
import { Link } from 'react-router-dom';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-20">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          مرحباً بك في Dibla
        </h1>
        <p className="text-gray-600 mb-6">
          التطبيق يعمل بشكل صحيح!
        </p>
        <div className="space-y-2 mb-6">
          <p className="text-sm text-gray-500">
            ✅ Frontend متصل
          </p>
          <p className="text-sm text-gray-500">
            ✅ React يعمل
          </p>
          <p className="text-sm text-gray-500">
            ✅ Tailwind CSS يعمل
          </p>
          <p className="text-sm text-gray-500">
            ✅ Routing يعمل
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/register"
            className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            اختبار إنشاء حساب
          </Link>

          <Link
            to="/auth/register?type=customer"
            className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            اختبار تسجيل مستخدم عادي
          </Link>

          <Link
            to="/auth/register?type=seller"
            className="block w-full bg-yellow-600 text-white text-center py-2 px-4 rounded hover:bg-yellow-700 transition-colors"
          >
            اختبار تسجيل صاحب متجر
          </Link>

          <Link
            to="/login"
            className="block w-full bg-gray-600 text-white text-center py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

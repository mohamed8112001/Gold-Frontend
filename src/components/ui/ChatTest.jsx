import React from 'react';
import FloatingChat from './FloatingChat.jsx';

// Test component to verify chat functionality
const ChatTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          🤖 اختبار المساعد الذكي المحسن
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">✨ التحسينات الجديدة:</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-yellow-600 mb-3">🎨 تحسينات الواجهة:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>تدرجات لونية حديثة ومتطورة</li>
                <li>تأثيرات بصرية وانيميشن سلسة</li>
                <li>خلفية شفافة مع تأثير الضباب</li>
                <li>رسائل بتصميم محسن وظلال خفيفة</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-600 mb-3">🚀 تحسينات الزر:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>شكل أكبر وأكثر وضوحاً</li>
                <li>أيقونة بوت بدلاً من دائرة الرسائل</li>
                <li>نقطة إشعار حمراء متحركة</li>
                <li>تأثير النبض عند الإغلاق</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 تعليمات الاختبار:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>انقر على الزر العائم في الأسفل لفتح المساعد الذكي</li>
            <li>إذا لم تكن مسجل دخول، ستحتاج لتسجيل الدخول أولاً</li>
            <li>جرب أسئلة مثل: "ما هي المنتجات المتاحة؟" أو "كم عدد المتاجر؟"</li>
            <li>المساعد يستخدم الذكاء الاصطناعي للإجابة على أسئلتك</li>
            <li>لاحظ التأثيرات البصرية الجديدة والانيميشن المحسن</li>
          </ul>
        </div>

        
      </div>
      
      {/* Floating Chat Component */}
      <FloatingChat />
    </div>
  );
};

export default ChatTest;
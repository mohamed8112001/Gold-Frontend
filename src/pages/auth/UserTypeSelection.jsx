import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { User, Store, Star, ShoppingBag, Heart, Calendar, BarChart3, Users, Package } from 'lucide-react';
import { ROUTES } from '../../utils/constants.js';

const UserTypeSelection = () => {
  const [selectedType, setSelectedType] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedType) {
      navigate(`${ROUTES.REGISTER}?type=${selectedType}`);
    }
  };

  const userTypes = [
    {
      id: 'customer',
      title: 'Regular User',
      titleAr: 'مستخدم عادي',
      description: 'Browse and explore gold shops',
      descriptionAr: 'تصفح واستكشف متاجر الذهب',
      icon: User,
      features: [
        { icon: ShoppingBag, text: 'تصفح مجموعات المجوهرات' },
        { icon: Star, text: 'حفظ العناصر المفضلة' },
        { icon: BarChart3, text: 'مقارنة الأسعار' },
        { icon: Heart, text: 'قراءة التقييمات' }
      ],
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'seller',
      title: 'Shop Owner',
      titleAr: 'صاحب متجر',
      description: 'Register Your Jewelry Store',
      descriptionAr: 'سجل متجر المجوهرات الخاص بك',
      icon: Store,
      features: [
        { icon: Store, text: 'إدارة متجر المجوهرات الخاص بك' },
        { icon: Package, text: 'رفع كتالوج المنتجات' },
        { icon: BarChart3, text: 'تتبع التحليلات' },
        { icon: Users, text: 'إدارة العملاء' }
      ],
      color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">Dibla</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Account
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join The Dibla Community And Discover Exquisite Jewelry
          </p>
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

        {/* Account Type Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Choose Your Account Type
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {userTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? `${type.color} ring-2 ring-offset-2 ring-yellow-500 shadow-lg` 
                      : 'hover:shadow-md border-gray-200'
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isSelected ? type.color : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-8 h-8 ${
                        isSelected ? type.iconColor : 'text-gray-600'
                      }`} />
                    </div>
                    <CardTitle className="text-xl font-bold">
                      {type.titleAr}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {type.descriptionAr}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {type.features.map((feature, index) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                            <FeatureIcon className={`w-5 h-5 ${
                              isSelected ? type.iconColor : 'text-gray-500'
                            }`} />
                            <span className={`text-sm ${
                              isSelected ? 'text-gray-800' : 'text-gray-600'
                            }`}>
                              {feature.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            size="lg"
            className={`px-12 py-3 text-lg font-medium ${
              selectedType 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </Button>
          
          <div className="mt-6 text-center">
            <span className="text-gray-600">Already have account? </span>
            <Link 
              to={ROUTES.LOGIN}
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-200 rounded-full opacity-20"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-300 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-400 rounded-full opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;


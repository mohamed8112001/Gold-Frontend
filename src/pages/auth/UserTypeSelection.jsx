import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card.jsx';
import {
  User,
  Store,
  Star,
  ShoppingBag,
  Heart,
  BarChart3,
  Users,
  Package
} from 'lucide-react';
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
      description: 'Browse and explore gold shops',
      icon: User,
      features: [
        { icon: ShoppingBag, text: 'Browse jewelry collections' },
        { icon: Star, text: 'Save favorite items' },
        { icon: BarChart3, text: 'Compare prices' },
        { icon: Heart, text: 'Read reviews' }
      ],
      color: 'bg-[#FEF7ED] border-[#E5D5C3] hover:bg-[#FDF4E8]',
      iconColor: 'text-[#A37F41]',
      buttonColor: 'bg-[#A37F41] hover:bg-[#8B6A35]'
    },
    {
      id: 'seller',
      title: 'Shop Owner',
      description: 'Register Your Jewelry Store',
      icon: Store,
      features: [
        { icon: Store, text: 'Manage your jewelry store' },
        { icon: Package, text: 'Upload product catalog' },
        { icon: BarChart3, text: 'Track analytics' },
        { icon: Users, text: 'Customer management' }
      ],
      color: 'bg-[#FEF7ED] border-[#E5D5C3] hover:bg-[#FDF4E8]',
      iconColor: 'text-[#A37F41]',
      buttonColor: 'bg-[#A37F41] hover:bg-[#8B6A35]'
    }
  ];

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'linear-gradient(135deg, #fef7ed 0%, #ffffff 50%, #fef3e2 100%)' }}>
      <div className="w-full max-w-6xl py-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #A37F41 0%, #B8904F 100%)' }}>
              <span className="text-2xl font-bold text-white">Dibla</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#A37F41' }}>
            Create Your Account
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B5B47' }}>
            Join The Dibla Community And Discover Exquisite Jewelry
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border" style={{ borderColor: '#E5D5C3' }}>
            <div className="px-6 py-2 rounded-md font-medium" style={{ backgroundColor: '#F5F1EB', color: '#A37F41' }}>
              Sign Up
            </div>
            <Link
              to={ROUTES.LOGIN}
              className="px-6 py-2 rounded-md font-medium transition-colors hover:opacity-80"
              style={{ color: '#6B5B47' }}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Account Type Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#A37F41' }}>
            Choose Your Account Type
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {userTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all duration-300 ${isSelected
                    ? `${type.color} ring-2 ring-offset-2 shadow-md`
                    : 'hover:shadow-sm border'
                    }`}
                  style={{
                    borderColor: isSelected ? '#A37F41' : '#E5D5C3',
                    ringColor: isSelected ? '#A37F41' : 'transparent'
                  }}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isSelected ? type.color : 'bg-gray-100'
                        }`}
                    >
                      <IconComponent
                        className={`w-8 h-8 ${isSelected ? type.iconColor : 'text-gray-600'
                          }`}
                      />
                    </div>
                    <CardTitle className="text-xl font-bold" style={{ color: isSelected ? '#A37F41' : '#6B5B47' }}>
                      {type.title}
                    </CardTitle>
                    <CardDescription style={{ color: isSelected ? '#6B5B47' : '#9CA3AF' }}>
                      {type.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {type.features.map((feature, index) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div
                            key={index}
                            className="flex items-center space-x-3"
                          >
                            <FeatureIcon
                              className={`w-5 h-5 ${isSelected
                                ? type.iconColor
                                : 'text-gray-500'
                                }`}
                            />
                            <span
                              className="text-sm"
                              style={{ color: isSelected ? '#6B5B47' : '#9CA3AF' }}
                            >
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
            className="px-12 py-3 text-lg font-medium rounded-md text-white transition-all duration-200"
            style={{
              background: selectedType
                ? 'linear-gradient(135deg, #A37F41 0%, #B8904F 100%)'
                : '#D1D5DB',
              color: selectedType ? 'white' : '#6B7280',
              cursor: selectedType ? 'pointer' : 'not-allowed'
            }}
            onMouseEnter={(e) => {
              if (selectedType) {
                e.target.style.background = 'linear-gradient(135deg, #8B6A35 0%, #A37F41 100%)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedType) {
                e.target.style.background = 'linear-gradient(135deg, #A37F41 0%, #B8904F 100%)';
              }
            }}
          >
            Continue
          </Button>

          <div className="mt-6 text-center">
            <span style={{ color: '#6B5B47' }}>Already have account? </span>
            <Link
              to={ROUTES.LOGIN}
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: '#A37F41' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;

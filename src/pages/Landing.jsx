import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { ROUTES } from '../utils/constants.js';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center pt-20">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-600 mb-4">Dibla</h1>
        <p className="text-xl text-gray-600 mb-8">Gold Market Platform</p>
        <div className="space-x-4">
          <Button
            onClick={() => navigate(ROUTES.HOME)}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Enter Platform
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;


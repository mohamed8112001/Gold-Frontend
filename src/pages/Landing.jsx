import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { ROUTES } from '../utils/constants.js';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F4ED] via-white to-[#F0E8DB] flex items-center justify-center pt-20">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#A37F41] mb-4">Dibla</h1>
        <p className="text-xl text-[#6D552C] mb-8">Gold Market Platform</p>
        <div className="space-x-4">
          <Button
            onClick={() => navigate(ROUTES.HOME)}
            className="bg-[#A37F41] hover:bg-[#8A6C37]"
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


import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleGoogleCallback();
        // Redirect to home page after successful authentication
        navigate(ROUTES.HOME);
      } catch (error) {
        console.error('Google authentication failed:', error);
        // Redirect to login page with error
        navigate(ROUTES.LOGIN + '?error=google_auth_failed');
      }
    };

    handleCallback();
  }, [handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

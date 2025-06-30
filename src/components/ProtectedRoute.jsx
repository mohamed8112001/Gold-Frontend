import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requireAuth = true, userType = null }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري التحقق من الهوية..." />
      </div>
    );
  }

  // إذا كان المسار يتطلب عدم تسجيل الدخول (مثل صفحات تسجيل الدخول)
  if (!requireAuth && isAuthenticated) {
    // توجيه المستخدم حسب نوعه
    const redirectPath = user.userType === 'store-owner' 
      ? '/dashboard/store-owner' 
      : '/dashboard/user';
    return <Navigate to={redirectPath} replace />;
  }

  // إذا كان المسار يتطلب تسجيل الدخول
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // إذا كان المسار يتطلب نوع مستخدم معين
  if (requireAuth && userType && user.userType !== userType) {
    const redirectPath = user.userType === 'store-owner' 
      ? '/dashboard/store-owner' 
      : '/dashboard/user';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;


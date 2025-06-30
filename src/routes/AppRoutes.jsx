import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProductsProvider } from '../context/ProductsContext';
import { StoresProvider } from '../context/StoresContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';
import Footer from '../components/Footer';

// الصفحات
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Home from '../pages/Home';
import UserDashboard from '../pages/UserDashboard';
import StoreOwnerDashboard from '../pages/StoreOwnerDashboard';
import StoreDetails from '../pages/StoreDetails';
import ProductDetails from '../pages/ProductDetails';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <StoresProvider>
        <ProductsProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Routes>
                {/* صفحات المصادقة - بدون Header/Footer */}
                <Route 
                  path="/signin" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <SignIn />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <SignUp />
                    </ProtectedRoute>
                  } 
                />

                {/* الصفحات الأخرى - مع Header/Footer */}
                <Route path="/*" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        {/* الصفحة الرئيسية */}
                        <Route path="/" element={<Home />} />
                        
                        {/* لوحات التحكم */}
                        <Route 
                          path="/dashboard" 
                          element={
                            <ProtectedRoute requireAuth={true} userType="user">
                              <UserDashboard />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/dashboard/store-owner" 
                          element={
                            <ProtectedRoute requireAuth={true} userType="store-owner">
                              <StoreOwnerDashboard />
                            </ProtectedRoute>
                          } 
                        />

                        {/* صفحات المحلات والمنتجات */}
                        <Route path="/store/:id" element={<StoreDetails />} />
                        <Route path="/product/:id" element={<ProductDetails />} />

                        {/* صفحات أخرى */}
                        <Route path="/stores" element={<Home />} />
                        <Route path="/collections" element={<Home />} />
                        <Route path="/about" element={<Home />} />

                        {/* إعادة توجيه للصفحات غير الموجودة */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
            </div>
          </Router>
        </ProductsProvider>
      </StoresProvider>
    </AuthProvider>
  );
};

export default AppRoutes;


import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import NewColorShowcase from './components/NewColorShowcase.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/auth/Login.jsx';
import UserTypeSelection from './pages/auth/UserTypeSelection.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import GoogleCallback from './pages/auth/GoogleCallback.jsx';
import ShopList from './pages/shop/ShopList.jsx';
import ShopDetails from './pages/shop/ShopDetails.jsx';
import CreateShop from './pages/shop/CreateShop.jsx';
import EditShop from './pages/shop/EditShop.jsx';
import ManageShop from './pages/shop/ManageShop.jsx';
import ShopActivationRequest from './pages/shop/ShopActivationRequest.jsx';
import ProductList from './pages/product/ProductList.jsx';
import ProductDetails from './pages/product/ProductDetails.jsx';
import CreateProduct from './pages/product/CreateProduct.jsx';
import EditProduct from './pages/product/EditProduct.jsx';
import Favorites from './pages/product/Favorites.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import Profile from './pages/user/Profile.jsx';
import Settings from './pages/user/Settings.jsx';
import BookAppointment from './pages/booking/BookAppointment.jsx';
import MyBookings from './pages/booking/MyBookings.jsx';
import ManageBookings from './pages/seller/ManageBookings.jsx';
import ManageTimes from './pages/seller/ManageTimes.jsx';
import BookingsOnly from './pages/seller/BookingsOnly.jsx';
import TimeManagement from './pages/seller/TimeManagement.jsx';
import ManageRatings from './pages/seller/ManageRatings.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ShopActivationManagement from './pages/admin/ShopActivationManagement.jsx';
import AboutUs from './pages/static/AboutUs.jsx';
import ContactUs from './pages/static/ContactUs.jsx';
import Careers from './pages/static/Careers.jsx';
import News from './pages/static/News.jsx';
import HelpCenter from './pages/static/HelpCenter.jsx';
import RatingTest from './pages/test/RatingTest.jsx';
import FAQ from './pages/static/FAQ.jsx';
import TermsConditions from './pages/static/TermsConditions.jsx';
import ReturnsPolicy from './pages/static/ReturnsPolicy.jsx';
import ShippingPolicy from './pages/static/ShippingPolicy.jsx';
import QualityAssurance from './pages/static/QualityAssurance.jsx';
import CustomerComplaints from './pages/static/CustomerComplaints.jsx';
import CreateAdmin from './pages/admin/CreateAdmin.jsx';
import PromoteToAdmin from './pages/admin/PromoteToAdmin.jsx';
import DemoAdminLogin from './pages/admin/DemoAdminLogin.jsx';
import NotFound from './pages/NotFound.jsx';
import TestPage from './pages/TestPage.jsx';
import './App.css';
import FavoriteProducts from './pages/product/FavoriteProducts.jsx';
import ShopChat from './components/ui/ShopChat.jsx';
import FloatingChat from './components/ui/FloatingChat.jsx';
import OwnerPaymentPrompt from './pages/auth/OwnerPaymentPrompt.jsx';
import { useAuth } from './context/AuthContext.jsx';
import SuccessPage from './components/ui/successPage.jsx';

// Protected Route Component for better performance
function ProtectedRoute({ children, requiresPayment = false, requiresApproval = false, requiresBoth = false }) {
  const { user, isShopOwner, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    // Check if both payment and approval are required (for products)
    if (requiresBoth && isShopOwner) {
      if (!user?.paid) {
        console.log('🔄 Seller needs to pay for product management...');
        navigate('/owner-payment', { replace: true });
        return;
      }
      // Shop approval check will be handled by the component itself
      // since we need to fetch shop data from the API
    }

    // Check if payment is required and user hasn't paid
    else if (requiresPayment && isShopOwner && !user?.paid) {
      console.log('🔄 Seller needs to pay, redirecting to payment page...');
      navigate('/owner-payment', { replace: true });
      return;
    }

    // Check if shop approval is required (for shop management features)
    else if (requiresApproval && isShopOwner) {
      // This will be handled by the individual components that need to check shop status
      // since we need to fetch shop data from the API
    }
  }, [user, isShopOwner, isLoading, requiresPayment, requiresApproval, requiresBoth, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A37F41]"></div>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/test-rating" element={<RatingTest />} />
              <Route path="/colors" element={<NewColorShowcase />} />

              {/* Auth Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/register" element={<UserTypeSelection />} />
              <Route path="/auth/user-type" element={<UserTypeSelection />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route path="/owner-payment" element={<OwnerPaymentPrompt />} />
              <Route path='/success' element={<SuccessPage />} />

              {/* Shop Routes - Protected for paid shop owners */}
              <Route path="/shops" element={<ShopList />} />
              <Route path="/shops/:id" element={<ShopDetails />} />
              <Route path='/shops/:id/chat' element={<ShopChat />} />
              <Route
                path="/shop/create"
                element={
                  <ProtectedRoute>
                    <CreateShop />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/edit"
                element={
                  <ProtectedRoute requiresPayment={true}>
                    <EditShop />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/edit/:id"
                element={
                  <ProtectedRoute requiresPayment={true}>
                    <EditShop />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/manage"
                element={
                  <ProtectedRoute requiresPayment={true}>
                    <ManageShop />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shop/activation-request/:id"
                element={
                  <ProtectedRoute>
                    <ShopActivationRequest />
                  </ProtectedRoute>
                }
              />

              {/* Product Routes - Protected for paid shop owners */}
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route
                path="/products/create"
                element={
                  <ProtectedRoute requiresBoth={true}>
                    <CreateProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/edit/:id"
                element={
                  <ProtectedRoute requiresBoth={true}>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />
              <Route path="/favorites" element={<FavoriteProducts />} />

              {/* User Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

              {/* Booking Routes */}
              <Route path="/book-appointment/:shopId" element={<BookAppointment />} />
              <Route path="/booking/:shopId" element={<BookAppointment />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route
                path="/bookings/manage"
                element={
                  <ProtectedRoute requiresPayment={true}>
                    <ManageBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-times"
                element={
                  <ProtectedRoute requiresPayment={true}>
                    <ManageTimes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings-only"
                element={
                  <ProtectedRoute requiresPayment={true}>
                    <BookingsOnly />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/time-management"
                element={
                  <ProtectedRoute requiresPayment={true}>
                    <TimeManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-ratings"
                element={
                  <ProtectedRoute requiresPayment={true}>
                    <ManageRatings />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/shop-activations" element={<ShopActivationManagement />} />
              <Route path="/admin/create" element={<CreateAdmin />} />
              <Route path="/admin/promote" element={<PromoteToAdmin />} />
              <Route path="/demo-login" element={<DemoAdminLogin />} />

              {/* Static Pages Routes */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/news" element={<News />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<TermsConditions />} />

              {/* Legal Pages Routes */}
              <Route path="/returns" element={<ReturnsPolicy />} />
              <Route path="/shipping" element={<ShippingPolicy />} />
              <Route path="/quality" element={<QualityAssurance />} />
              <Route path="/complaints" element={<CustomerComplaints />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <FloatingChat />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
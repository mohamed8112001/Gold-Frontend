import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
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
import ProductList from './pages/product/ProductList.jsx';
import ProductDetails from './pages/product/ProductDetails.jsx';
import CreateProduct from './pages/product/CreateProduct.jsx';
import Favorites from './pages/product/Favorites.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import Profile from './pages/user/Profile.jsx';
import Settings from './pages/user/Settings.jsx';
import BookAppointment from './pages/booking/BookAppointment.jsx';
import MyBookings from './pages/booking/MyBookings.jsx';
import ManageBookings from './pages/seller/ManageBookings.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CreateAdmin from './pages/admin/CreateAdmin.jsx';
import PromoteToAdmin from './pages/admin/PromoteToAdmin.jsx';
import DemoAdminLogin from './pages/admin/DemoAdminLogin.jsx';
import NotFound from './pages/NotFound.jsx';
import TestPage from './pages/TestPage.jsx';
import './App.css';
import FavoriteProducts from './pages/product/FavoriteProducts.jsx';

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

              {/* Auth Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/register" element={<UserTypeSelection />} />
              <Route path="/auth/user-type" element={<UserTypeSelection />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />

              {/* Shop Routes */}
              <Route path="/shops" element={<ShopList />} />
              <Route path="/shops/:id" element={<ShopDetails />} />
              <Route path="/shop/create" element={<CreateShop />} />
              <Route path="/shop/edit" element={<EditShop />} />
              <Route path="/shop/edit/:id" element={<EditShop />} />
              <Route path="/shop/manage" element={<ManageShop />} />

              {/* Product Routes */}
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/products/create" element={<CreateProduct />} />
              <Route path="/favorites" element={<FavoriteProducts />} />

              {/* User Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />

              {/* Booking Routes */}
              <Route path="/book-appointment/:shopId" element={<BookAppointment />} />
              <Route path="/booking/:shopId" element={<BookAppointment />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/bookings/manage" element={<ManageBookings />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create" element={<CreateAdmin />} />
              <Route path="/admin/promote" element={<PromoteToAdmin />} />
              <Route path="/demo-login" element={<DemoAdminLogin />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/auth/Login.jsx';
import UserTypeSelection from './pages/auth/UserTypeSelection.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import GoogleCallback from './pages/auth/GoogleCallback.jsx';
import ShopList from './pages/shop/ShopList.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import BookAppointment from './pages/booking/BookAppointment.jsx';
import NotFound from './pages/NotFound.jsx';
import TestPage from './pages/TestPage.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/register" element={<UserTypeSelection />} />
            <Route path="/auth/user-type" element={<UserTypeSelection />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/shops" element={<ShopList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/book-appointment/:shopId" element={<BookAppointment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;


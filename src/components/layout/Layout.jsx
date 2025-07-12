import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { useLocation } from 'react-router-dom';


const Layout = ({ children = true, className = '' }) => {
  const location = useLocation();

  const hiddenHeaderRoutes = [
    "/login",
    "/auth/login",
    "/register",
    "/auth/register",
    "/auth/user-type",
    "/auth/forgot-password",
    "/forgot-password",
    "/auth/google/callback",
    "/demo-login",
  ];
    const hiddenFooterRoutes = [
    "/login",
    "/auth/login",
    "/register",
    "/auth/register",
    "/auth/user-type",
    "/auth/forgot-password",
    "/forgot-password",
    "/auth/google/callback",
    "/demo-login",
  ];
  const shouldHideHeader = hiddenHeaderRoutes.includes(location.pathname);

    const shouldHideFooter = hiddenFooterRoutes.includes(location.pathname);


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!shouldHideHeader && <Header />}

      <main className={`flex-1 ${!shouldHideHeader ? 'pt-20' : ''} ${className}`}>
        {children}
      </main>

      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default Layout;


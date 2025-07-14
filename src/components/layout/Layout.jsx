import React, { useEffect } from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Layout = ({ children = true, className = '' }) => {
  const location = useLocation();
  const { i18n } = useTranslation();

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

  const hiddenFooterRoutes = hiddenHeaderRoutes;

  const shouldHideHeader = hiddenHeaderRoutes.includes(location.pathname);
  const shouldHideFooter = hiddenFooterRoutes.includes(location.pathname);

  // تغيير اتجاه الصفحة تلقائيًا حسب اللغة
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

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

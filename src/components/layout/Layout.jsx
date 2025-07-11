import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const Layout = ({ children, showFooter = true, className = '' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className={`flex-1 pt-20 ${className}`}>
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;


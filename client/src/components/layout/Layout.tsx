import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container-custom py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
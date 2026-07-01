import React, { ReactNode } from 'react';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container-custom py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
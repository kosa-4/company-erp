'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-100">
      <Sidebar />
      <Header />
      
      <main className="ml-[260px] pt-16 min-h-screen">
        <div className="p-6">
          <Breadcrumb />
          <div className="animate-fadeIn">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

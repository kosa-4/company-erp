'use client';

import React from 'react';
import VendorSidebar from './VendorSidebar';
import VendorHeader from './VendorHeader';
import VendorBreadcrumb from './VendorBreadcrumb';

interface VendorLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VendorLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-100">
      <VendorSidebar />
      <VendorHeader />
      
      <main className="ml-[260px] pt-16 min-h-screen">
        <div className="p-6">
          <VendorBreadcrumb />
          <div className="animate-fadeIn">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorLayout;

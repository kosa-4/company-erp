'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';

interface MainLayoutProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 }
  }
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      <Sidebar />
      <Header />
      
      <main className="ml-[260px] pt-16 min-h-screen">
        <div className="p-6">
          <Breadcrumb />
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Hero, AuthModal } from '@/components/landing';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleGetStarted = () => {
    // Purchase ERP 버튼 - 홈 페이지로 이동
    router.push('/home');
  };

  const openLogin = () => {
    // 로그인 버튼 - 로그인 모달 표시
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const closeModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#fdfbf7] text-slate-900 selection:bg-indigo-500/30 font-sans">
      {/* Background Ambience (Light Theme) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-rose-100/60 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 contrast-150 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <Hero onGetStarted={handleGetStarted} onLogin={openLogin} />
        </main>

        <footer className="w-full py-6 text-center text-slate-500 text-sm border-t border-slate-200 backdrop-blur-sm">
          <p>© 2024 KOSA Academy. All systems nominal.</p>
        </footer>
      </div>

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal 
            mode={authMode} 
            onClose={closeModal} 
            onSwitchMode={(mode) => setAuthMode(mode)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

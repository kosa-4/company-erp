'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Hero, AuthModal } from '@/components/landing';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Landing page that routes authenticated users to their home or opens a login modal for unauthenticated users.
 *
 * Displays a loading spinner while authentication state is loading. When the "Purchase ERP" action is triggered,
 * the component re-checks the session: if a user exists it navigates to `/home` for company type 'B' or `/vendor/home`
 * for other company types; if no user exists it opens the authentication modal in login mode.
 *
 * @returns The React element for the landing page.
 */
export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading, checkSession } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  /**
   * "Purchase ERP" 버튼 클릭 핸들러
   * - 세션 확인 후 라우팅 또는 로그인 모달 표시
   */
  const handleGetStarted = async () => {
    // 세션 다시 확인 (최신 상태 반영)
    await checkSession();

    if (user) {
      // 세션 있으면 → comType에 따라 페이지 이동
      if (user.comType === 'B') {
        router.push('/home');
      } else {
        router.push('/vendor/home');
      }
    } else {
      // 세션 없으면 → 로그인 모달 표시
      setAuthMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsAuthModalOpen(false);
  };

  // 로딩 중일 때 표시할 내용 (선택)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

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
          <Hero onGetStarted={handleGetStarted} />
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
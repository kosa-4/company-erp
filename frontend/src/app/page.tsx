"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Hero, AuthModal } from "@/components/landing";
import { useAuth } from "@/contexts/AuthContext";

/**
 * 랜딩 페이지
 *
 * "Purchase ERP" 버튼 클릭 시:
 * - 세션 있으면 → comType에 따라 해당 페이지로 이동
 *   - B (구매사) → /home
 *   - V (협력사) → /vendor
 * - 세션 없으면 → 로그인 모달 표시
 */
export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading, checkSession } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  /**
   * "Fabrio" 버튼 클릭 핸들러
   * - 세션 확인 후 라우팅 또는 로그인 모달 표시
   */
  const handleGetStarted = async () => {
    // 세션 다시 확인 (최신 상태 반영)
    await checkSession();

    if (user) {
      // 세션 있으면 → comType에 따라 페이지 이동
      if (user.comType === "B") {
        router.push("/home");
      } else {
        router.push("/vendor");
      }
    } else {
      // 세션 없으면 → 로그인 모달 표시
      setAuthMode("login");
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
    <div className="relative min-h-screen w-full bg-white text-slate-900 selection:bg-emerald-500/30 font-sans">
      {/* Minimalist Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-50/50 via-white to-white"></div>
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

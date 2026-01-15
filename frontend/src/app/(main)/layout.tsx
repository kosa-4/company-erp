'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 구매사(B) 전용 레이아웃
 * 
 * - comType이 'B'인 사용자만 접근 가능
 * - 로그인 안 됨 → 랜딩 페이지로 리다이렉트
 * - 협력사(V)가 접근 시 → /vendor로 리다이렉트
 */
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 로딩 중에는 리다이렉트하지 않음
    if (isLoading) return;

    // 로그인 안 됨 → 랜딩 페이지로
    if (!user) {
      router.replace('/');
      return;
    }

    // 협력사가 접근 시 → 협력사 페이지로
    if (user.comType === 'V') {
      router.replace('/vendor');
      return;
    }
  }, [user, isLoading, router, pathname]);

  // 로딩 중 또는 인증 확인 중일 때 로딩 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 로그인 안 됨 → 빈 화면 (리다이렉트 중)
  if (!user) {
    return null;
  }

  // 협력사가 접근 → 빈 화면 (리다이렉트 중)
  if (user.comType !== 'B') {
    return null;
  }

  return <MainLayout>{children}</MainLayout>;
}

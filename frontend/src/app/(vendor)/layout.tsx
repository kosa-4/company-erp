'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { VendorLayout } from '@/components/vendor';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 협력사(V) 전용 레이아웃
 * 
 * - comType이 'V'인 사용자만 접근 가능
 * - 로그인 안 됨 → 랜딩 페이지로 리다이렉트
 * - 구매사(B)가 접근 시 → /home으로 리다이렉트
 */
export default function VendorAppLayout({
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

    // 구매사가 접근 시 → 구매사 페이지로
    if (user.comType === 'B') {
      router.replace('/home');
      return;
    }
  }, [user, isLoading, router, pathname]);

  // 로딩 중 또는 인증 확인 중일 때 로딩 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // 로그인 안 됨 → 빈 화면 (리다이렉트 중)
  if (!user) {
    return null;
  }

  // 구매사가 접근 → 빈 화면 (리다이렉트 중)
  if (user.comType !== 'V') {
    return null;
  }

  return <VendorLayout>{children}</VendorLayout>;
}

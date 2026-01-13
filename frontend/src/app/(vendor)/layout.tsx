'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { VendorLayout } from '@/components/vendor';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Layout wrapper that restricts access to vendor users (company type 'V').
 *
 * Shows a full-screen loading indicator while authentication is in progress.
 * Unauthenticated visitors are redirected to '/', and users with company type 'B' are redirected to '/home'.
 *
 * @param children - Content to render inside the vendor layout
 * @returns The vendor layout containing `children` when the current user has company type 'V'; otherwise `null` while redirects or authentication are in progress
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
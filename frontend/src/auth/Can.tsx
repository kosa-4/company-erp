'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 권한 기반 렌더링 컴포넌트
 * - roles: 허용할 role 목록
 * - fallback: 권한 없을 때 보여줄 컴포넌트 (기본 null)
 */
export function Can({
                        roles,
                        children,
                        fallback = null,
                    }: {
    roles: Array<'ADMIN' | 'BUYER' | 'USER' | 'VENDOR'>;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();

    // 세션 로딩 중엔 아무것도 안 그림 (깜빡임 방지)
    if (isLoading) return null;

    // 로그인 안 됐으면 fallback
    if (!user) return <>{fallback}</>;

    // role이 허용 목록에 없으면 fallback
    if (!roles.includes(user.role)) return <>{fallback}</>;

    // 권한 통과
    return <>{children}</>;
}

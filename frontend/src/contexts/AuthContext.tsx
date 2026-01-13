'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 세션에 저장된 사용자 정보 타입
 * - comType: 'B' (구매사) 또는 'V' (협력사)
 * - vendorCd: 협력사 코드 (협력사인 경우에만 값 있음)
 */
interface User {
  userId: string;
  comType: 'B' | 'V';
  vendorCd?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication context and manages user session state and routing.
 *
 * Manages current user and loading state, restores session on mount, and exposes
 * `login`, `logout`, and `checkSession` actions. `login` updates state and
 * navigates based on `comType` ('B' → /home, 'V' → /vendor/home). `logout`
 * clears session and navigates to the root.
 *
 * @returns A React context provider element that supplies `user`, `isLoading`,
 * `login`, `logout`, and `checkSession` to descendant components.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * 로그인 함수
   * - 성공 시 comType에 따라 자동 라우팅
   *   - B (구매사) → /home
   *   - V (협력사) → /vendor/home
   */
  const login = useCallback(async (userId: string, password: string) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, password }),
    });

    // 응답 텍스트를 먼저 가져옴
    const text = await res.text();
    
    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      // JSON이 아닌 경우 (백엔드 에러 등)
      throw new Error('서버 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }

    // 로그인 실패 처리
    if (!res.ok || !data.success) {
      throw new Error(data.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
    }
    
    // 응답 데이터에서 사용자 정보 추출
    const userData: User = {
      userId: data.data.userId,
      comType: data.data.comType,
      vendorCd: data.data.vendorCd,
    };

    setUser(userData);

    // comType에 따라 라우팅
    if (userData.comType === 'B') {
      router.push('/home');         // 구매사 → (main) 페이지
    } else {
      router.push('/vendor/home');  // 협력사 → (vendor) 페이지
    }
  }, [router]);

  /**
   * 로그아웃 함수
   * - 세션 종료 후 랜딩 페이지로 이동
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // 로그아웃 실패해도 클라이언트 상태는 초기화
    }
    setUser(null);
    router.push('/');
  }, [router]);

  /**
   * 세션 확인 함수
   * - 페이지 새로고침 시 세션 유효성 확인
   * - 유효한 세션이면 사용자 정보 복원
   */
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/session', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setUser({
            userId: data.data.userId,
            comType: data.data.comType,
            vendorCd: data.data.vendorCd,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 마운트 시 세션 확인
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Accesses the authentication context for the current React component tree.
 *
 * @returns The authentication context containing `user`, `isLoading`, `login`, `logout`, and `checkSession`.
 * @throws Error if the hook is used outside of an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}
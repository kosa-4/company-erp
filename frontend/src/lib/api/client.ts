/**
 * Session 기반 인증 API 클라이언트
 * 
 * - credentials: 'include'로 세션 쿠키 자동 전송
 * - 공통 헤더 설정
 * - 에러 처리 통합
 */

import { ApiError } from './error';

/**
 * API 요청 옵션 타입
 */
interface ApiOptions extends Omit<RequestInit, 'body'> {
  /** 쿼리 파라미터 */
  params?: Record<string, string | number | boolean | undefined>;
  /** JSON으로 변환할 요청 본문 */
  body?: unknown;
}

/**
 * 기본 API 호출 함수
 * @param endpoint - API 엔드포인트 (예: '/items', '/users/1')
 * @param options - 요청 옵션
 * @returns 응답 데이터
 */
async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { params, body, headers, ...restOptions } = options;

  // URL 생성 (쿼리 파라미터 포함)
  let url = `/api/v1${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // fetch 요청
  const response = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // 세션 쿠키 자동 전송
    body: body ? JSON.stringify(body) : undefined,
  });

  // 에러 처리
  if (!response.ok) {
    // 응답 본문 파싱 시도
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    // 401: 로그인 필요 → 로그인 페이지로 이동
    if (response.status === 401) {
      // 이미 로그인 페이지면 무한 리다이렉트 방지
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    throw new ApiError(response.status, response.statusText, errorData);
  }

  // 204 No Content 처리
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * API 편의 함수
 */
export const api = {
  /**
   * GET 요청
   * @example api.get<Item[]>('/items')
   * @example api.get<Item[]>('/items', { page: 1, size: 10 })
   */
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    apiClient<T>(endpoint, { method: 'GET', params }),

  /**
   * POST 요청
   * @example api.post<Item>('/items', { itemName: '노트북', unitPrice: 1500000 })
   */
  post: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body }),

  /**
   * PUT 요청
   * @example api.put<Item>('/items/1', { itemName: '노트북 Pro' })
   */
  put: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body }),

  /**
   * PATCH 요청
   * @example api.patch<Item>('/items/1', { useYn: 'N' })
   */
  patch: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body }),

  /**
   * DELETE 요청
   * @example api.delete<void>('/items/1')
   */
  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};

export default api;

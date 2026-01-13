/**
 * Session 기반 인증 API 클라이언트
 *
 * - credentials: 'include'로 세션 쿠키 자동 전송
 * - 공통 헤더 설정
 * - 에러 처리 통합
 */

import { ApiError } from "./error";

/**
 * API 요청 옵션 타입
 */
interface ApiOptions extends Omit<RequestInit, "body"> {
  /** 쿼리 파라미터 */
  params?: Record<string, string | number | boolean | undefined>;
  /** JSON으로 변환할 요청 본문 */
  body?: unknown;
}

/**
 * Send a session-based JSON HTTP request to the backend and return the parsed response.
 *
 * Builds a request to /api/v1{endpoint} with optional query parameters and a JSON body, includes credentials and merged headers, handles empty/204 responses by returning an empty object, redirects the browser to /login for session-related statuses (401, 440) and shows an alert then redirects for status 441, and throws an ApiError containing status, statusText, and any parsed error body when the response is not ok.
 *
 * @param endpoint - Path appended to /api/v1 (for example, '/items' or '/users/1')
 * @param options - Request options; may include `params` (query key/value pairs), `body` (object to be JSON-stringified), and additional headers
 * @returns The response payload parsed as `T`; returns `{}` when the response has no content
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
      if (value !== undefined && value !== null && value !== "") {
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
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
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
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }

    // 440: 세션 없음 → 로그인 페이지로 이동
    if (response.status === 440) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }

    // 441: 중복 로그인 → 로그인 페이지로 이동 (다른 곳에서 로그인함)
    if (response.status === 441) {
      if (typeof window !== "undefined") {
        alert("다른 곳에서 로그인하여 세션이 종료되었습니다.");
        window.location.href = "/login";
      }
    }

    throw new ApiError(response.status, response.statusText, errorData);
  }

  // 204 No Content 처리
  if (response.status === 204) {
    return {} as T;
  }

  // 200 OK + 빈 body 처리
  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");

  // Content-Length가 0이거나 Content-Type이 없으면 빈 body로 처리
  if (
    contentLength === "0" ||
    !contentType ||
    !contentType.includes("application/json")
  ) {
    // body가 있는지 확인
    const text = await response.text();
    if (!text || text.trim() === "") {
      return {} as T;
    }
    // body가 있으면 JSON 파싱
    return JSON.parse(text) as T;
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
  get: <T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ) => apiClient<T>(endpoint, { method: "GET", params }),

  /**
   * POST 요청
   * @example api.post<Item>('/items', { itemName: '노트북', unitPrice: 1500000 })
   */
  post: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: "POST", body }),

  /**
   * PUT 요청
   * @example api.put<Item>('/items/1', { itemName: '노트북 Pro' })
   */
  put: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: "PUT", body }),

  /**
   * PATCH 요청
   * @example api.patch<Item>('/items/1', { useYn: 'N' })
   */
  patch: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: "PATCH", body }),

  /**
   * DELETE 요청
   * @example api.delete<void>('/items/1')
   */
  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: "DELETE" }),
};

export default api;
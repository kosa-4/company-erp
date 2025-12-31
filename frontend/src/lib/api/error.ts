/**
 * API 에러 처리 유틸리티
 */

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * HTTP 상태 코드별 기본 에러 메시지
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: '입력 정보를 확인해주세요.',
  401: '로그인이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 데이터를 찾을 수 없습니다.',
  409: '이미 존재하는 데이터입니다.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  502: '서버에 연결할 수 없습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
};

/**
 * 에러에서 사용자 친화적 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  // ApiError인 경우
  if (error instanceof ApiError) {
    // 서버에서 보낸 메시지가 있으면 우선 사용
    if (error.data && typeof error.data === 'object') {
      const data = error.data as Record<string, unknown>;
      if (typeof data.message === 'string' && data.message) {
        return data.message;
      }
    }
    // 상태 코드별 기본 메시지
    return ERROR_MESSAGES[error.status] || `오류가 발생했습니다. (${error.status})`;
  }

  // 일반 Error인 경우
  if (error instanceof Error) {
    return error.message || '오류가 발생했습니다.';
  }

  // 그 외
  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러 알림 표시
 * 나중에 Toast 컴포넌트로 교체 가능
 */
export function showError(error: unknown): void {
  const message = getErrorMessage(error);
  alert(message);
}

/**
 * 401 에러인지 확인
 */
export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/**
 * 403 에러인지 확인
 */
export function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

/**
 * 404 에러인지 확인
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

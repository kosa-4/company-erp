package com.company.erp.common.exception;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * API 공통 응답 객체
 * 
 * 사용 예시:
 * - 메시지만 반환: ApiResponse.ok("성공")
 * - 데이터 반환: ApiResponse.ok(userData)
 * - 메시지 + 데이터: ApiResponse.ok("로그인 성공", userData)
 * 
 * @param <T> 응답 데이터 타입
 */
@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;

    /**
     * 성공 응답 (메시지만)
     */
    public static ApiResponse<Void> ok(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /**
     * 성공 응답 (데이터만)
     * - 로그인 시 사용자 정보 반환 등에 사용
     */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, null, data);
    }

    /**
     * 성공 응답 (메시지 + 데이터)
     */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * 실패 응답
     */
    public static ApiResponse<Void> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }
}

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
     * Create a successful API response that contains only a message.
     *
     * @param message the message to include in the response
     * @return an ApiResponse with `success` set to `true`, the provided `message`, and `data` set to `null`
     */
    public static ApiResponse<Void> ok(String message) {
        return new ApiResponse<>(true, message, null);
    }

    /**
     * Create a successful ApiResponse that carries response data.
     *
     * @param <T>  the type of the response data
     * @param data the response payload to include in the ApiResponse
     * @return     an ApiResponse containing the provided data and no message
     */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, null, data);
    }

    /**
     * Create a successful ApiResponse containing both a message and data.
     *
     * @param message a human-readable message describing the result
     * @param data    the payload to include in the response
     * @param <T>     the type of the response data
     * @return        an ApiResponse with success = true, the provided message, and the provided data
     */
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    /**
     * Create a failure API response containing an error message.
     *
     * @param message the failure message to include in the response
     * @return `ApiResponse<Void>` with `success` set to `false`, the provided message, and `data` set to `null`
     */
    public static ApiResponse<Void> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
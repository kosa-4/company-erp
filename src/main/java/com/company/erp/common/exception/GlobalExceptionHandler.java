package com.company.erp.common.exception;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 입력값 오류 / 인증 실패 / 비즈니스 검증 실패
    @ExceptionHandler(IllegalArgumentException.class)
    public ApiResponse handleIllegalArgument(IllegalArgumentException e) {
        return ApiResponse.fail(e.getMessage());
    }

    // 서버 상태/데이터 이상 (사용자에게 상세 노출 X)
    @ExceptionHandler(IllegalStateException.class)
    public ApiResponse handleIllegalState(IllegalStateException e) {
        return ApiResponse.fail("요청 처리 중 오류가 발생했습니다.");
    }

    // 예상 못한 서버 오류 (안전망)
    @ExceptionHandler(Exception.class)
    public ApiResponse handleException(Exception e) {
//         log.error("Unexpected exception", e);
        return ApiResponse.fail("서버 오류가 발생했습니다.");
    }
}

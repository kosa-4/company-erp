package com.company.erp.common.exception;

/**
 * 인증 세션이 없거나 유효하지 않을 때 발생시키는 예외
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}

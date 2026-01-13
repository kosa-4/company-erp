package com.company.erp.common.exception;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import com.company.erp.common.file.exception.FileException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;



@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 잘못된 파라미터로 발생한 예외 처리
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
    // 찾으려는 데이터가 없을 때 발생한 예외 처리
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoSuchElementException e) {
        log.error("NoSuchElementException: {}", e.getMessage(), e);
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    // 필수 데이터 누락 등 null 참조 시 발생한 예외 처리
    @ExceptionHandler(NullPointerException.class)
    public ResponseEntity<Map<String, String>> handleNullPointer(NullPointerException e) {
        log.error("NullPointerException: {}", e.getMessage(), e);
        Map<String, String> error = new HashMap<>();
        error.put("message", "필수 데이터가 누락되었습니다.");
        return ResponseEntity.badRequest().body(error);
    }
    // 모든 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        Map<String, String> error = new HashMap<>();
        error.put("message", "서버 오류가 발생했습니다: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // 상태 전이 오류 등 비즈니스 로직 예외 처리
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException e) {
        log.error("IllegalStateException: {}", e.getMessage(), e);
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error); // 409 Conflict
    }

    // 파일 오류 예외 처리
    @ExceptionHandler(FileException.class)
    public ApiResponse handleFile(FileException e) {
        return ApiResponse.fail(e.getMessage());
    }


}

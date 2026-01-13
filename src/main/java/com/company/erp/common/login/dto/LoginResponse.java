package com.company.erp.common.login.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class LoginResponse {

    private final boolean success;
    private final String message;

    public static LoginResponse ok(String message) {
        return new LoginResponse(true, message);
    }

    public static LoginResponse fail(String message) {
        return new LoginResponse(false, message);
    }
}

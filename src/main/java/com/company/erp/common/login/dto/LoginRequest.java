package com.company.erp.common.login.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginRequest {
    private String userId;     // 아이디
    private String password;   // 비밀번호
}

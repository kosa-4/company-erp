package com.company.erp.common.session;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import java.io.Serializable;

@Getter
@ToString
@RequiredArgsConstructor
public class SessionUser implements Serializable {

    private static final long serialVersionUID = 1L;

    private final String userId;
    private final String ipAddress;
    private final String comType;   // B: 구매사, V: 협력사
    private final String vendorCd;  // 협력사일 때만 값 있음

    private final String userName;   // 사용자명
    private final String deptCd;     // 부서코드
    private final String deptName;   // 부서명

    private final String role;       // ADMIN / BUYER / USER / VENDOR
}


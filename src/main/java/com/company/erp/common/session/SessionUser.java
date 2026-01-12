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
}


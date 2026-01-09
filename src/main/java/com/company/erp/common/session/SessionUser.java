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
}


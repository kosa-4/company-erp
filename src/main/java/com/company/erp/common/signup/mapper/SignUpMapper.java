package com.company.erp.common.signup.mapper;

import com.company.erp.common.signup.dto.SignUpDto;


public interface SignUpMapper {
    void insertVendorUser(SignUpDto signUpDto);
    boolean existsUserId(String userId);

}

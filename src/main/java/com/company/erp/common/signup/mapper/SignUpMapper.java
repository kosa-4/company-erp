package com.company.erp.common.signup.mapper;

import com.company.erp.common.signup.dto.UserDto;


public interface SignUpMapper {
    void insertUser(UserDto userDto);
    boolean existsUserId(String userId);

}

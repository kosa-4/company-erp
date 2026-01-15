package com.company.erp.common.login.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface LoginMapper {
//    Map<String, Object> findLoginUser(@Param("userId") String userId);
    Map<String, Object> findByUserLoginUser(String userId); // 구매사 사용자 조회
    Map<String, Object> findVnUserLoginUser(String userId); // 협력사 사용자 조회
}
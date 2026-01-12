package com.company.erp.common.login.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface LoginMapper {
    Map<String, Object> findLoginUser(@Param("userId") String userId);
}
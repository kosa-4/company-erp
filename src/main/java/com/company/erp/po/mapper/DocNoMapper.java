package com.company.erp.po.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DocNoMapper {
    void getDocNo(Map<String, Object> param);
}

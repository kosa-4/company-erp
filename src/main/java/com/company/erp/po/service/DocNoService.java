package com.company.erp.po.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.erp.po.mapper.DocNoMapper;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class DocNoService {

    private final DocNoMapper docNoMapper;
    @Transactional
    public String generatePoNo() {
        Map<String, Object> param = new HashMap<>();
        param.put("docType", "PO");
        docNoMapper.getDocNo(param);
        return (String) param.get("docNo");
    }
}

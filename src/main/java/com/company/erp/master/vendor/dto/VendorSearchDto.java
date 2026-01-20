package com.company.erp.master.vendor.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VendorSearchDto {

    // 검색 정보
    private String vendorCode;
    private String vendorName;
    private String businessType;
    private String industry; // 업종
    private String useYn;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // 페이징
    private int page = 1;
    private int pageSize = 10;

    // 가져올 행의 시작 위치 계산
    public int getOffset() {
        return (page - 1) * pageSize;
    }
}

package com.company.erp.master.item.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ItemSearchDto {
    private String itemCode;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime modifiedAt;
    private String modifiedBy;
    private String itemName;
    private String itemNameEn;
    private String spec;
    private String manufacturerName;
    private String modelNo;
    private String status;
    private String remark;
    private String unit;
    private String useYn;
    private LocalDate date;
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDate;
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endDate;

    // 페이징
    private int page;
    private int pageSize = 5;

    // 가져올 행의 초기 인덱스(시작 위치) 계산
    public int getOffset(){
        return (page - 1) * pageSize;
    }
}

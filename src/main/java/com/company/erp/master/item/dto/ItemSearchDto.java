package com.company.erp.master.item.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ItemSearchDto {
    private String ITEM_CD;
    private String ITEM_NM;
    private String USE_FLAG;
    private LocalDateTime REG_DATE_FROM;
    private LocalDateTime REG_DATE_TO;
    private String MAKER_NM;

    // 페이징
    private int page = 1;
    private int pageSize = 5;

    // 가져올 행의 초기 인덱스(시작 위치) 계산
    public int getOffset(){
        return (page - 1) * pageSize;
    }
}

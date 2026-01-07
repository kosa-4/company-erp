package com.company.erp.master.item.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true) // 부모와 자식 필드 구분
@Data
public class ItemSearchDto extends ItemDto {
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // 페이징
    private int page;
    private int pageSize = 5;

    // 가져올 행의 초기 인덱스(시작 위치) 계산
    public int getOffset(){
        return (page - 1) * pageSize;
    }
}

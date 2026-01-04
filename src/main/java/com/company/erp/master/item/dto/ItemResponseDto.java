package com.company.erp.master.item.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ItemResponseDto<T> { // 추후에 자식 필드의 T(타입) 결정
    private List<T> items;
    private int page;
    private int pageSize;
    private int totalPages;
    private int totalCount;
}

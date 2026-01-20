package com.company.erp.master.category.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryListDto {
    private String itemCls;
    private String parentItemCls;
    private int itemLvl;
    private String itemClsNm;
    private String useFlag;
    private String createdBy;
    private LocalDateTime createdAt;
    private String modifiedBy;
    private LocalDateTime modifiedAt;
}

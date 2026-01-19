package com.company.erp.master.category.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CategoryListDto {
    private String itemCls;
    private String parentItemCls;
    private int itemLvl;
    private String itemClsNm;
    private String useFlag;
    private String createdBy;
    private LocalDate createdAt;
    private String modifiedBy;
    private LocalDate modifiedAt;
}

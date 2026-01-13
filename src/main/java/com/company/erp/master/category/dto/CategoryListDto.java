package com.company.erp.master.category.dto;

import lombok.Data;

@Data
public class CategoryListDto {
    private String itemCls;
    private String parentItemCls;
    private int itemLvl;
    private String itemClsNm;
    private String useFlag;
}

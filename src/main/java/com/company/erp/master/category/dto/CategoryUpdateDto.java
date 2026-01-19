package com.company.erp.master.category.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CategoryUpdateDto {
    private String itemCls;
    private String modifiedBy;
    private LocalDate modifiedAt;
    private String delFlag;

}

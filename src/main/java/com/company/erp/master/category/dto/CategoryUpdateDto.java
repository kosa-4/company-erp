package com.company.erp.master.category.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CategoryUpdateDto {
    private String itemClsNm;
    private String itemCls;
    private String modifiedBy;
    private LocalDateTime modifiedAt;
    private String delFlag;
    private String useFlag;

}

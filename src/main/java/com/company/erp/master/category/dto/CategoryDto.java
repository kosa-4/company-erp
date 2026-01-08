package com.company.erp.master.item.dto;

import java.time.LocalDate;

public class CategoryDto {
    private String itemCls;
    private String parentItemCls;
    private int itemLvl;
    private String itemClsNm;
    private LocalDate regDate;
    private String regUserId;
    private LocalDate modDate;
    private String modUserId;
    private String delFlag;
    private String useFlag;
}

/*
    ITEM_CLS	품목분류코드	VARCHAR2(50)	PRIMARY KEY
    PARENT_ITEM_CLS	상위분류코드	VARCHAR2(50)	FK
    ITEM_LVL	계층레벨	INT	NOT NULL	0: 품목분류, 1:대, 2:중, 3:소
    ITEM_CLS_NM	분류명	VARCHAR2(50)	NOT NULL
    REG_DATE	등록일자	DATE	NOT NULL
    REG_USER_ID	등록자ID	VARCHAR2(50)	NOT NULL
    MOD_DATE	수정일자	DATE
    MOD_USER_ID	수정자ID	VARCHAR2(50)
    DEL_FLAG	삭제여부	VARCHAR2(2)	NOT NULL	‘N’, ‘Y’
    USE_FLAG	사용여부	VARCHAR2(2)	NOT NULL	‘N’, ‘Y’
 */

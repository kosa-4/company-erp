package com.company.erp.master.item.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class ItemDetailDto extends ItemDto{
    private String itemType; // 품목 종류
    private String categoryL; // 대분류
    private String categoryM; // 중분류
    private String categoryS; // 소분류
    private int unitPrice;
}
/*
    ITEM_CD	품목번호	VARCHAR2(50)	PRIMARY KEY
    REG_DATE	등록일자	DATE	NOT NULL
    REG_USER_ID	등록자ID	VARCHAR2(50)	NOT NULL
    MOD_DATE	수정일자	DATE
    MOD_USER_ID	수정자ID	VARCHAR2(50)
    DEL_FLAG	삭제여부	VARCHAR2(2)	NOT NULL	‘N’, ‘Y’
    ITEM_CLS	품목종류	VARCHAR2(50)	NOT NULL
    ITEM_CLS1	대분류	VARCHAR2(50)
    ITEM_CLS2	중분류	VARCHAR2(50)
    ITEM_CLS3	소분류	VARCHAR2(50)
    USE_FLAG	사용여부	VARCHAR2(2)	NOT NULL	‘N’, ‘Y’
 */
package com.company.erp.master.item.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
public class ItemDto {
    private String ITEM_CD;
    private LocalDateTime REG_DATE;
    private String REG_USER_ID;
    private LocalDateTime MOD_DATE;
    private String MOD_USER_ID;
    private String DEL_FLAG;
    private String USE_FLAG;
    private String USE_RMK;
    private String ITEM_NM;
    private String ITEM_NM_ENG;
    private String ITEM_SPEC;
    private String ITEM_RMK;
    private String MAKER_CD;
    private String MAKER_NM;
    private String MODEL_NO;
    private String DEPT_CD;
    private String PROGRESS_CD;
    private String RMK;
    private String UNIT_CD;
}
/*
    ITEM_CD	품목코드	VARCHAR2(50)	PRIMARY KEY
    REG_DATE	등록일자	DATE	NOT NULL
    REG_USER_ID	등록자ID	VARCHAR2(50)	NOT NULL
    MOD_DATE	수정일자	DATE
    MOD_USER_ID	수정자ID	VARCHAR2(50)
    DEL_FLAG	삭제여부	VARCHAR2(2)	NOT NULL
    USE_FLAG	사용여부	VARCHAR2(2)	NOT NULL
    USE_RMK	중지사유	VARCHAR2(500)
    ITEM_NM	품목명	VARCHAR2(200)	NOT NULL
    ITEM_NM_ENG	품목 영문명	VARCHAR2(200)
    ITEM_SPEC	규격	VARCHAR2(100)
    ITEM_RMK	품목상세설명	VARCHAR2(1000)
    MAKER_CD	제조사코드	VARCHAR2(50)
    MAKER_NM	제조사명	VARCHAR2(100)
    MODEL_NO	제조모델번호	VARCHAR2(100)
    DEPT_CD	사용부서	VARCHAR2(100)
    PROGRESS_CD	상태	VARCHAR2(20)		A, R
    RMK	비고	VARCHAR2(1000)
    UNIT_CD	단위	VARCHAR2(20)		EA
 */
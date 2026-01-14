package com.company.erp.master.item.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Data
public class ItemDto {
    private String itemCode; // 품목 코드
    private LocalDate createdAt; // 등록 일자
    private String createdBy; // 등록자
    private LocalDate modifiedAt; // 수정 일자
    private String modifiedBy; // 수정자
    private String deleteYn; // 삭제 여부
    private String useYn; // 사용 여부
    private String stopReason; // 중지 사유
    private String itemName; // 품목명
    private String itemNameEn; // 품목 영문명
    private String spec; // 규격
    private String itemRemark; // 품목 상세 설명
    private String manufacturerCode; // 제조사 코드
    private String manufacturerName; // 제조사 명
    private String modelNo ; // 제조 모델 번호
    private String departmentCode; // 사용 부서
    private String status; // 상태
    private String remark; // 비고
    private String unit; // 단위
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
    MAKER_NM	제조사명	VARCHAR2(100)
    MODEL_NO	제조모델번호	VARCHAR2(100)
    DEPT_CD	사용부서	VARCHAR2(100)
    PROGRESS_CD	상태	VARCHAR2(20)		A, R
    RMK	비고	VARCHAR2(1000)
    UNIT_CD	단위	VARCHAR2(20)		EA
 */
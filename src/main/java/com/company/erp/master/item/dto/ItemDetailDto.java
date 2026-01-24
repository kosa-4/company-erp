package com.company.erp.master.item.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ItemDetailDto{
    private String itemCode; // 품목 코드
    private LocalDateTime createdAt; // 등록 일자
    private String createdBy; // 등록자
    private LocalDateTime modifiedAt; // 수정 일자
    private String modifiedBy; // 수정자
    private String useYn; // 사용 여부
    private String stopReason; // 중지 사유
    @NotBlank(message = "필수 입력 사항입니다.")
    private String itemName; // 품목명
    private String itemNameEn; // 품목 영문명
    private String spec; // 규격
    private String manufacturerName; // 제조사 명
    private String modelNo ; // 제조 모델 번호
    private String status; // 상태
    private String remark; // 비고
    @NotBlank(message = "필수 입력 사항입니다.")
    private String unit; // 단위
    private String itemType; // 품목 종류
    private String categoryL; // 대분류
    private String categoryM; // 중분류
    private String categoryS; // 소분류
    private String itemTypeCode;
    private String categoryLCode;
    private String categoryMCode;
    private String categorySCode;
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
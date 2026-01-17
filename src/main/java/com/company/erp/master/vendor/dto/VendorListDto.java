package com.company.erp.master.vendor.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class VendorListDto {
    private String askNum;
    private String vendorCode;
    private String vendorName;
    private String vendorNameEng;
    private String businessType;
    private String businessNo;
    private String ceoName;
    private String address;
    private String addressDetail;
    private String industry; // 업종
    private String useYn;
    private String status;
    private String createdBy;
    private LocalDate createdAt;
    private String zipCode;
    private String tel;
    private String remark;
    private boolean editable;
}

/*
'   VENDOR_CD	협력사코드	VARCHAR2(50)	PRIMARY KEY
    REG_DATE	등록일자	DATE	NOT NULL
    REG_USER_ID	등록자ID	VARCHAR2(50)	NOT NULL
    MOD_DATE	수정일자	DATE
    MOD_USER_ID	수정자ID	VARCHAR2(50)
    DEL_FLAG	삭제여부	VARCHAR2(2)	NOT NULL
    USE_FLAG	사용여부	VARCHAR2(2)	NOT NULL
    VENDOR_NM	업체명	VARCHAR2(255)	NOT NULL
    VENDOR_ENG_NM	업체 영문명	VARCHAR2(255)
    REG_TYPE	사업형태	VARCHAR2(20)		A : 개인, B : 법인
    IRS_NO	사업자등록번호	VARCHAR2(20)
    CEO_USER_NM	대표자명	VARCHAR2(100)
    ZIP_CD	우편번호	VARCHAR2(10)
    ADDR	주소	VARCHAR2(500)
    ADDR_DT	상세주소명	VARCHAR2(500)
    TEL_NO	전화번호	VARCHAR2(20)
    FAX_NO	팩스번호	VARCHAR2(20)
    EMAIL	이메일	VARCHAR2(100)
    FOUNDATION_DATE	설립일자	DATE
    INDUSTRY_TYPE	업종	VARCHAR2(100)
    ATT_FILE_NUM	첨부파일	NUMBER
    RMK	비고	VARCHAR2(1000)
    PROGRESS_CD	상태	VARCHAR(2)		A, R
    SIGN_DATE	승인/반려일자	DATE
 */

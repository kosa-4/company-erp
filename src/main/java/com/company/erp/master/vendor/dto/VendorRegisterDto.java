package com.company.erp.master.vendor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class VendorRegisterDto {

    private String askNum;
    private String vendorCode;
    @NotBlank(message = "필수 입력 사항입니다.")
    private String vendorName;
    private String vendorEngName;
    @NotBlank(message = "필수 입력 사항입니다.")
    private String businessType; // 사업 형태
    @NotBlank(message = "필수 입력 사항입니다.")
    private String businessNo;
    @NotBlank(message = "필수 입력 사항입니다.")
    private String ceoName;
    @NotBlank(message = "필수 입력 사항입니다.")
    private String zipCode;
    private String address;
    private String addressDetail;
    private String tel;
    private String fax;
    private String email;
    @NotBlank(message = "필수 입력 사항입니다.")
    private String industry; // 업종
    private String useYn;
    private String remark;
    private String createdBy;
    private String modifiedBy;
    private String status;

    private int attFileNum;

    private LocalDate createdAt;
    private LocalDate modifiedAt;
    private LocalDate foundationDate;
    private LocalDate signDate;
}

// VNGL
/*
    VENDOR_CD	협력사코드	VARCHAR2(50)	PRIMARY KEY
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


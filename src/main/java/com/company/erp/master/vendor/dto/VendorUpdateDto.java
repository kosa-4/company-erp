package com.company.erp.master.vendor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VendorUpdateDto {
    private String askNum;

    private String delFlag;
    private String status;
    private String signUserId;

    private LocalDateTime modifiedAt;
    private String modifiedBy;
    private String vendorCode;
    private String vendorName;
    private String vendorNameEng;
    private String businessType; // 사업 형태
    private String businessNo;
    private String ceoName;
    private String zipCode;
    private String address;
    private String addressDetail;
    private String tel;
    private String fax;
    private String industry; // 업종
    private String remark;
    private String email;
    private LocalDateTime signDate;

    // 반려 시
    private String rejectRemark;
    List<String> fileNums;
}

// VNCH
/*
    ASK_NUM	요청번호	VARCHAR2(50)	PK
    VENDOR_CD	협력사코드	VARCHAR2(50)
    REG_DATE	등록일자	DATE	NOT NULL
    REG_USER_ID	등록자ID	VARCHAR2(50)	NOT NULL
    MOD_DATE	수정일자	DATE
    MOD_USER_ID	수정자ID	VARCHAR2(50)
    DEL_FLAG	삭제여부	VARCHAR2(2)	NOT NULL
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
    RMK	비고	VARCHAR2(1000)
    PROGRESS_CD	상태	VARCHAR(2)
        N(신규),
        P(요청),
        A(승인),
        R(반려)
    REJECT_RMK	반려사유	VARCHAR2(1000)
    SIGN_USER_ID	승인/반려자	VARCHAR2(1000)
    COM_TYPE	회사 구분	VARCHAR2(2)	NOT NULL DEFAULT ‘V’	협력사는 ‘V’ 고정
 */

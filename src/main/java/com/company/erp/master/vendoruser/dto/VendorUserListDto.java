package com.company.erp.master.vendoruser.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class VendorUserListDto {
    private String askUserNum;
    private String vendorCode;
    private String vendorName;
    private String userId;
    private String userName;
    private String phone;
    private String email;
    private String status;
    private LocalDate createdAt;
    private String blockFlag;
    private String password;
}
/*
    ASK_USER_NUM	요청번호	VARCHAR2(50)	PRIMARY KEY
    VENDOR_CD	협력업체코드	VARCHAR2(50)	NOT NULL
    REG_DATE	등록일자	DATE	NOT NULL
    REG_USER_ID	등록자ID	VARCHAR2(50)	NOT NULL
    MOD_DATE	수정일자	DATE
    MOD_USER_ID	수정자ID	VARCHAR2(50)
    DEL_FLAG	삭제여부	VARCHAR2(2)	NOT NULL 	‘N’, ‘Y’
    USER_ID	사용자ID	VARCHAR2(50)	NOT NULL
    USER_NM	사용자명	VARCHAR2(100)	NOT NULL
    PROGRESS_CD	상태	VARCHAR2(2)	NOT NULL
        N(신규),
        C(요청),
        A(승인),
        R(반려)
    REQ_TYPE	요청유형	VARCHAR2(2)	NOT NULL
        I (추가),
        U (수정),
        D (삭제)
    TEL_NO	전화번호	VARCHAR2(20)
    FAX_NO	팩스번호	VARCHAR2(20)
    EMAIL	이메일	VARCHAR2(100)
    PASSWORD	비밀번호	VARCHAR2(255)	NOT NULL	암호화
    COM_TYPE	회사 구분	VARCHAR2(2)	NOT NULL  DEFAULT ‘V’	협력사는 ‘V’ 고정
 */
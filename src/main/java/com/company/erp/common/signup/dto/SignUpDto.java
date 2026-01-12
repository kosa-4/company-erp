package com.company.erp.common.signup.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignUpDto {
    // 파라미터에 @Valid 붙여줘야 함
    @NotBlank(message = "협력사 코드는 필수입니다.")
    private String vendorCd;
    @NotBlank(message = "아이디는 필수입니다.")
    private String userId;
    @NotBlank(message = "이름은 필수입니다.")
    private String userNm;
    private String userNmEng;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 최소 8자리 이상입니다.")
    private String password;
    private String telNum;
    private String faxNum;
    private String role;
}
/*
    VENDOR_CD	협력업체코드	VARCHAR2(20)	PRIMARY KEY
    USER_ID	사용자ID	VARCHAR2(50)	PRIMARY KEY
    USER_NM	사용자명	VARCHAR2(100)	NOT NULL
    USER_NM_ENG	사용자명(영문)	VARCHAR2(100)
    REG_DATE	등록일자	DATE	NOT NULL
    REG_USER_ID	등록자ID	VARCHAR2(50)	NOT NULL
    MOD_DATE	수정일자	DATE
    MOD_USER_ID	수정자ID	VARCHAR2(50)
    DEL_FLAG	삭제여부	VARCHAR(2)	NOT NULL	‘N’, ‘Y’
    BLOCK_FLAG	BLOCK여부	VARCHAR(2)
    BLOCK_RMK	BLOCK사유	VARCHAR2(500)
    BLOCK_DATE	BLOCK 처리일시	DATE
    PASSWORD	비밀번호	VARCHAR2(255)	NOT NULL	암호화
    USER_TYPE	사용자 구분	VARCHAR2(20)		일반 / 관리자
    PW_WRONG_CNT	비밀번호 틀린 횟수	NUMBER(3)	NOT NULL, 
    DEFAULT 0
    EMAIL	이메일	VARCHAR2(100)	NOT NULL
    TEL_NUM	전화번호	VARCHAR2(20)
    FAX_NUM	팩스번호	VARCHAR2(20)
    ROLE	담당업무	VARCHAR2(50)
    SIGN_DATE	승인/반려일자	DATE
    PROGRESS_CD	상태	VARCHAR(2)		A : 승인,
    R : 반려
    COM_TYPE	회사 구분	VARCHAR2(2)	NOT NULL
    DEFAULT ‘V’	협력사는 ‘V’ 고정
 */
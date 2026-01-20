package com.company.erp.common.signup.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SignUpDto {

    private String askNo;
    private String askUserNo;
    private String vendorCode;
    private String createdBy;
    private String comType;
    private String status;

    // 파라미터에 @Valid 붙여줘야 함
    // vendor 정보
    @NotBlank(message = "회사명은 필수입니다.")
    private String vendorName;
    private String vendorNameEn;

    @NotBlank(message = "필수 입력 사항입니다")
    private String businessType;

    @NotBlank(message = "필수 입력 사항입니다")
    private String businessNo;

    @NotBlank(message = "필수 입력 사항입니다")
    private String ceoName;

    @NotBlank(message = "필수 입력 사항입니다")
    private String industry; // 업종

    @NotBlank(message = "필수 입력 사항입니다")
    private String zipCode;
    private String address;
    private String addressDetail;

    @NotBlank(message = "필수 입력 사항입니다")
    @Pattern(regexp = "^\\d{2,3}-\\d{3,4}-\\d{4}$", message = "전화번호 형식이 올바르지 않습니다.")
    private String phone;

    @Pattern(regexp = "^\\d{2,3}-\\d{3,4}-\\d{4}$", message = "팩스번호 형식이 올바르지 않습니다.")
    private String fax;

    private String vendorEmail;

    private LocalDate foundationDate;

    // user 정보
    @NotBlank(message = "아이디는 필수입니다.")
    private String userId;

    @NotBlank(message = "이름은 필수입니다.")
    private String userName;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다")
    private String userEmail;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 최소 8자리 이상입니다.")
    private String password;

    private String reqType;

}
/*
    협력사
    ASK_NUM	요청번호	VARCHAR2(50)	PK
    VENDOR_CD	협력사코드	VARCHAR2(50)
    REG_DATE	등록일자	DATE	NOT NULL
    REG_USER_ID	등록자ID	VARCHAR2(50)	NOT NULL
    MOD_DATE	수정일자	DATE
    MOD_USER_ID	수정자ID	VARCHAR2(50)
    DEL_FLAG	삭제여부	VARCHAR2(2)	NOT NULL
    VENDOR_NM	업체명	VARCHAR2(255)	NOT NULL
    VENDOR_ENG_NM	업체 영문명	VARCHAR2(255)
    REG_TYPE	사업형태	VARCHAR2(20)		A : 개인,  B : 법인
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
    COM_TYPE	회사 구분	VARCHAR2(2)	NOT NULL DEFAULT ‘V' 협력사는 ‘V’ 고정
 */

/*
    사용자
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
    P(요청),
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
    COM_TYPE	회사 구분	VARCHAR2(2)	NOT NULL DEFAULT ‘V’	협력사는 ‘V’ 고정
 */
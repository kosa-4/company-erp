package com.company.erp.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//내 정보 기본정보
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyInfoDTO {
    private String userId;//사용자Id
    private String userNameKo;//사용자명(국문)
    private String userNameEn;//사용자명(영문)
    private String userType;//사용자구분
    private String role;// 업무 권한
    private String companyCode;//회사코드
    private String companyName;//회사명
    private String departmentCode;//부서코드
    private String departmentName;//부서명
    private String phone;//전화번호
    private String email;//이메일
    private String mobile;//휴대폰
    private String fax;//팩스번호
}

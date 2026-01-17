package com.company.erp.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//내 정보 업데이트 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyInfoUpdateDTO {
    private String userId;          // 사용자 ID
    private String userNameEn;      // 사용자명
    private String phone;           // 전화번호
    private String email;           // 이메일
    private String fax;             // 팩스번호
    private String password;        // 새 비밀번호
}

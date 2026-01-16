package com.company.erp.mypage.service;

import com.company.erp.common.session.SessionUser;
import com.company.erp.mypage.dto.MyInfoDTO;
import com.company.erp.mypage.dto.MyInfoUpdateDTO;
import com.company.erp.mypage.mapper.MyPageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class MyPageService {

    private final MyPageMapper myPageMapper;
    private final PasswordEncoder passwordEncoder;


    public MyInfoDTO selectMyInfo(SessionUser user){
        MyInfoDTO myInfos = myPageMapper.selectMyInfo(
                user.getUserId(),
                user.getUserName(),
                convertComTypeToUserType(user.getComType()),
                convertRoleToKorean(user.getRole()),
                user.getDeptCd(),
                user.getDeptName()
        );
        return myInfos;
    }

    //내 정보 업데이트
    @Transactional
    public void updateMyInfo(MyInfoUpdateDTO dto, SessionUser user) {

        
        // 비밀번호가 있으면 암호화
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            String encryptedPassword = passwordEncoder.encode(dto.getPassword());
            dto.setPassword(encryptedPassword);
        } else {
            dto.setPassword(null); // 비밀번호 없으면 null로 설정
        }
        

        int updatedRows = myPageMapper.updateMyInfo(dto);
        
        if (updatedRows == 0) {
            throw new IllegalStateException("내 정보 수정에 실패했습니다.");
        }
        
    }
    
    private String convertComTypeToUserType(String comType) {
        if (comType == null) return "";
        return "B".equals(comType) ? "구매사" : "협력사";
    }
    
    private String convertRoleToKorean(String role) {
        if (role == null) return "담당자";
        
        switch (role) {
            case "ADMIN":
                return "관리자";
            case "BUYER":
                return "구매담당자";
            case "VENDOR":
                return "협력사담당자";
            default:
                return "담당자";
        }
    }
}

package com.company.erp.mypage.service;

import com.company.erp.common.session.SessionUser;
import com.company.erp.mypage.dto.MyInfoDTO;
import com.company.erp.mypage.dto.MyInfoUpdateDTO;
import com.company.erp.mypage.mapper.MyPageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

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

    //협력사 사용자 정보 조회
    public Map<String, String> getVendorUserInfo(String userId) {
        if (userId == null || userId.isEmpty()) {
            return new HashMap<>();
        }
        
        try {
            Map<String, String> userInfo = myPageMapper.selectVendorUserInfo(userId);
            
            if (userInfo == null) {
                return new HashMap<>();
            }
            
            Map<String, String> result = new HashMap<>();
            result.put("userName", userInfo.getOrDefault("userName", ""));
            result.put("email", userInfo.getOrDefault("email", ""));
            result.put("vendorName", userInfo.getOrDefault("vendorName", ""));
            result.put("vendorNameEn", userInfo.getOrDefault("vendorNameEn", ""));
            result.put("businessNo", userInfo.getOrDefault("businessNo", ""));
            result.put("address", userInfo.getOrDefault("address", ""));
            result.put("ceoName", userInfo.getOrDefault("ceoName", ""));
            result.put("industry", userInfo.getOrDefault("industry", ""));
            result.put("phone", userInfo.getOrDefault("phone", ""));
            result.put("zipCode", userInfo.getOrDefault("zipCode", ""));
            
            return result;
        } catch (Exception e) {
            System.err.println("협력사 사용자 정보 조회 실패: " + e.getMessage());
            e.printStackTrace();
            return new HashMap<>();
        }
    }
    //협력사 사용자 비밀번호 업데이트
    @Transactional
    public void updateVendorUserPassword(String userId, String password) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("사용자 ID가 필요합니다.");
        }
        
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("비밀번호가 필요합니다.");
        }
        
        // 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(password);
        
        int updatedRows = myPageMapper.updateVendorUserInfo(userId, encryptedPassword);
        
        if (updatedRows == 0) {
            throw new IllegalStateException("비밀번호 변경에 실패했습니다.");
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

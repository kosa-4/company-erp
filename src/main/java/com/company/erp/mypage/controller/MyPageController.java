package com.company.erp.mypage.controller;

import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import com.company.erp.mypage.dto.MyInfoDTO;
import com.company.erp.mypage.dto.MyInfoUpdateDTO;
import com.company.erp.mypage.service.MyPageService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/mypage")
public class MyPageController {

    private final MyPageService myPageService;


    //내 정보 초기 데이터 조회
    @GetMapping("/init")
    public ResponseEntity<MyInfoDTO> initMyPageInfo(HttpSession httpSession){
        SessionUser user = getSessionUser(httpSession);

        MyInfoDTO myInfo = myPageService.selectMyInfo(user);

        return ResponseEntity.ok(myInfo);
    }

    //내 정보 수정
    @PutMapping("/update")
    public ResponseEntity<Map<String, String>> updateMyPageInfo(
            @RequestBody MyInfoUpdateDTO updateDTO,
            HttpSession httpSession) {
        
        SessionUser user = getSessionUser(httpSession);
        
        try {
            updateDTO.setUserId(user.getUserId());
            
            myPageService.updateMyInfo(updateDTO, user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "내 정보가 수정되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("잘못된 요청입니다 : " + e.getMessage());
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
            
        }
    }

   //협력사 사용자 정보 조회
    @GetMapping("/vendor/user-info")
    public ResponseEntity<Map<String, String>> getVendorUserInfo(HttpSession httpSession) {
        SessionUser user = getSessionUser(httpSession);

        if (user == null) {
            System.err.println("세션 사용자 정보가 없습니다.");
            return ResponseEntity.status(401).build();
        }


        try {
            Map<String, String> userInfo = myPageService.getVendorUserInfo(user.getUserId());
            
            if (userInfo == null || userInfo.isEmpty()) {
                System.err.println("사용자 정보를 찾을 수 없습니다: " + user.getUserId());
                return ResponseEntity.status(404).body(Map.of("error", "사용자 정보를 찾을 수 없습니다."));
            }
            
            System.out.println("협력사 사용자 정보 조회 성공: " + userInfo);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            System.err.println("협력사 사용자 정보 조회 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "서버 오류가 발생했습니다."));
        }
    }
    
    //사용자 비밀번호 수정
    @PutMapping("/vendor/update-password")
    public ResponseEntity<Map<String, String>> updateVendorPassword(
            @RequestBody Map<String, String> request,
            HttpSession httpSession) {
        
        SessionUser user = getSessionUser(httpSession);
        
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            String password = request.get("password");
            
            if (password == null || password.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "비밀번호를 입력해주세요.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            myPageService.updateVendorUserPassword(user.getUserId(), password);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "비밀번호가 변경되었습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.err.println("비밀번호 변경 실패: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "비밀번호 변경에 실패했습니다.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    private SessionUser getSessionUser(HttpSession session) {
        if (session == null) {
            return null;
        }
        Object obj = session.getAttribute(SessionConst.LOGIN_USER);
        return (obj instanceof SessionUser) ? (SessionUser) obj : null;
    }
}

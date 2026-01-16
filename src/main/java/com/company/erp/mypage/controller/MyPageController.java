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

    private SessionUser getSessionUser(HttpSession session) {
        if (session == null) {
            return null;
        }
        Object obj = session.getAttribute(SessionConst.LOGIN_USER);
        return (obj instanceof SessionUser) ? (SessionUser) obj : null;
    }
}

package com.company.erp.common.login.controller;

import com.company.erp.common.login.dto.LoginRequest;
import com.company.erp.common.login.dto.LoginResponse;
import com.company.erp.common.login.service.DuplicateLoginService;
import com.company.erp.common.login.service.LoginService;
import com.company.erp.common.session.SessionUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class LoginController {

    private final LoginService loginService;
    private final DuplicateLoginService duplicateLoginService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req, HttpServletRequest request) {

        // ip 확보
        String ipAddress = clientIp(request);

        try {
            // 서비스에서 인증 + 유저 정보 조회 (comType/vendorCd 포함) + SessionUser 생성까지 끝냄
            SessionUser sessionUser = loginService.login(req, ipAddress);

            // 세션 생성
            HttpSession session = request.getSession(true);

            // 중복 로그인 처리 + registry 등록 + 세션 저장
            duplicateLoginService.handleLoginSuccess(sessionUser, session);

            // 성공
            return LoginResponse.ok("로그인 성공");

        } catch (IllegalArgumentException e) {
            // 입력값/인증 실패
            return LoginResponse.fail(e.getMessage());

        } catch (IllegalStateException e) {
            // 데이터/alias 등 서버 처리 문제
            return LoginResponse.fail("로그인 처리 중 오류가 발생했습니다.");
        }
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}

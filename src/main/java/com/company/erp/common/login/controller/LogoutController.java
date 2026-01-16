package com.company.erp.common.login.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionRegistry;
import com.company.erp.common.session.SessionUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class LogoutController {

    private final SessionRegistry sessionRegistry;

    @PostMapping("/logout")
    public ApiResponse logout(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session == null) {
            return ApiResponse.ok("로그아웃 완료");
        }

        String sessionId = session.getId();

        Object sessionAttr = session.getAttribute(SessionConst.LOGIN_USER);
        SessionUser sessionUser = (sessionAttr instanceof SessionUser) ? (SessionUser) sessionAttr : null;

        if (sessionUser != null) {
            sessionRegistry.unregister(sessionUser.getUserId(), sessionId);
        } else {
            // 세션에 유저 정보가 없으면 sessionId로 방어 정리
            sessionRegistry.unregisterBySessionId(sessionId);
        }

        try {
            session.invalidate();
        } catch (IllegalStateException ignore) {
        }

        return ApiResponse.ok("로그아웃 완료");
    }
}
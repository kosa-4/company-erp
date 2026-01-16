package com.company.erp.common.login.service;

import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionRegistry;
import com.company.erp.common.session.SessionUser;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DuplicateLoginService {

    private final SessionRegistry sessionRegistry;

    public void handleLoginSuccess(SessionUser loginUser, HttpSession currentSession) {
        String userId = loginUser.getUserId();
        String currentSessionId = currentSession.getId();

        // 1) 기존 로그인 세션 조회 (없으면 null)
        String existingSessionId = sessionRegistry.getExistingSessionId(userId);

        // 2) 기존 세션이 있고, 지금 세션과 다르면 기존 세션을 강퇴 대상 표시
        if (existingSessionId != null && !existingSessionId.equals(currentSessionId)) {
            sessionRegistry.markLogoutTarget(existingSessionId);
        }

        // 3) 현재 세션을 userId의 최신 로그인 세션으로 등록
        sessionRegistry.registerLogin(userId, currentSessionId);

        // 4) 현재 세션에 로그인 사용자 저장
        currentSession.setAttribute(SessionConst.LOGIN_USER, loginUser);
    }
}
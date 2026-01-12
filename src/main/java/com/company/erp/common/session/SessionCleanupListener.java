package com.company.erp.common.session;

import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SessionCleanupListener implements HttpSessionListener {

    private final SessionRegistry sessionRegistry;

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        if (se == null || se.getSession() == null) return;

        String sessionId = se.getSession().getId();

        // 세션이 파괴될 때 registry 역맵/정방향맵/강퇴표식까지 정리
        sessionRegistry.unregisterBySessionId(sessionId);
    }
}
package com.company.erp.common.session;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class SessionInterceptor implements HandlerInterceptor {

    private final SessionRegistry sessionRegistry;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // 0) @SessionIgnore면 스킵
        if (isSessionIgnored(handler)) return true;

        HttpSession session = request.getSession(false);

        // 1) 세션 자체가 없음
        if (session == null) {
            return reject(response, SessionConst.STATUS_NO_SESSION); // 440
        }

        String sessionId = session.getId();

        // 2) 중복로그인 강퇴 대상이면 remove 성공한 첫 요청만 실제 강퇴 처리 -> 동시 요청 시 중복 invalidate 방지
        if (sessionRegistry.removeLogoutTarget(sessionId)) {
            // 레지스트리 정리(양방향 맵/표식)
            sessionRegistry.unregisterBySessionId(sessionId);

            // 세션 종료
            safeInvalidate(session);

            return reject(response, SessionConst.STATUS_MULTI_LOGIN); // 441
        }

        // 3) 로그인 사용자 확인
        SessionUser loginUser = (SessionUser) session.getAttribute(SessionUser.class.getName());
        if (loginUser == null) {
            return reject(response, SessionConst.STATUS_NO_SESSION); // 440
        }

        return true;
    }

    // @SessionIgnore가 붙은 컨트롤러/메서드는 세션 가드 대상에서 제외
    private boolean isSessionIgnored(Object handler) {
        if (!(handler instanceof HandlerMethod)) return false;

        HandlerMethod hm = (HandlerMethod) handler;

        if (hm.hasMethodAnnotation(SessionIgnore.class)) return true;
        return hm.getBeanType().isAnnotationPresent(SessionIgnore.class);
    }

    // 세션이 유효하지 않을 때 요청을 어떻게 끝낼지 결정 -> redirect 없이 HTTP 상태코드만 내려서 요청 차단
    private boolean reject(HttpServletResponse response, int status) {
        response.setStatus(status);
        return false;
    }

    // 세션 종료
    private void safeInvalidate(HttpSession session) {
        try {
            session.invalidate();
        } catch (IllegalStateException ignore) {
        }
    }
}

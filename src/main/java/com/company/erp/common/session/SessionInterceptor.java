package com.company.erp.common.session;

import com.company.erp.common.auth.RequireRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

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
            try {
                session.invalidate();
            } catch (IllegalStateException ignore) {
            }

            return reject(response, SessionConst.STATUS_MULTI_LOGIN); // 441
        }

        // 3) 로그인 사용자 확인
        Object sessionAttr = session.getAttribute(SessionUser.class.getName());
        SessionUser loginUser = (sessionAttr instanceof SessionUser) ? (SessionUser) sessionAttr : null;
        if (loginUser == null) {
            // 세션은 있는데 loginUser가 없으면 registry 찌꺼기 정리(만료/비정상 세션 방어)
            sessionRegistry.unregisterBySessionId(sessionId);
            return reject(response, SessionConst.STATUS_NO_SESSION); // 440
        }

        // 4) 권한 체크 (@RequireRole)
        // - 컨트롤러/메서드에 @RequireRole이 붙어있으면 loginUser.role로 권한 검사
        // - 없으면(권한 제한 없음) 그냥 통과
        if (!checkRoleAuthorization(handler, loginUser, response)) {
            return false; // checkRoleAuthorization 내부에서 응답 처리(403)
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

    // 권한 체크 로직
    private boolean checkRoleAuthorization(Object handler, SessionUser loginUser, HttpServletResponse response) {
        if (!(handler instanceof HandlerMethod)) return true;

        HandlerMethod hm = (HandlerMethod) handler;

        // 메서드 우선 → 없으면 클래스에서 탐색
        RequireRole requireRole = hm.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = hm.getBeanType().getAnnotation(RequireRole.class);
        }

        // @RequireRole 없으면 제한 없음
        if (requireRole == null) return true;

        String userRole = loginUser.getRole(); // "BUYER"/"USER"/"VENDOR"/"ADMIN"
        if (userRole == null || userRole.isBlank()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
            return false;
        }
        String normalized = userRole.trim();

        boolean allowed = Arrays.stream(requireRole.value())
                .map(String::trim)
                .anyMatch(r -> r.equalsIgnoreCase(normalized));

        if (!allowed) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
            return false;
        }

        return true;
    }

    // 세션이 유효하지 않을 때 요청을 어떻게 끝낼지 결정 -> redirect 없이 HTTP 상태코드만 내려서 요청 차단
    private boolean reject(HttpServletResponse response, int status) {
        response.setStatus(status);
        return false;
    }
}

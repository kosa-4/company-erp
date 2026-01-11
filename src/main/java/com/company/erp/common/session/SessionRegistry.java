package com.company.erp.common.session;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionRegistry {

    // userId(key), sessionId(value) - 로그인 된 userId의 sessionId 저장할 맵
    private final Map<String, String> userToSession = new ConcurrentHashMap<>();

    // sessionId(key), userId(value)  역방향도 저장
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    // 로그아웃 대상인 sessionId ( 로그인했던 sessionId )
    private final Set<String> logoutTargetSessions = ConcurrentHashMap.newKeySet();

    // 기존 로그인된 세션 있는지 확인 (없으면 null)
    public String getExistingSessionId(String userId) {
        return userToSession.get(normalize(userId));
    }

    // 로그인 후 userId에 현재 sessionId 등록 - 같은 userId가 재로그인하면 이전 sessionId 역맵 정리
    public void registerLogin(String userId, String sessionId) {
        String uid = normalize(userId);
        if (uid.isEmpty() || sessionId == null) return;

        // 기존 세션이 있으면 역방향 맵에서 제거
        String oldSessionId = userToSession.put(uid, sessionId);
        if (oldSessionId != null) sessionToUser.remove(oldSessionId);

        // 새 세션 역방향 등록
        sessionToUser.put(sessionId, uid);
    }

    // 로그아웃 될 대상인 Id에게 표식남기기
    public void markLogoutTarget(String sessionId) {
        if (sessionId != null) logoutTargetSessions.add(sessionId);
    }

    // 강제 로그아웃 대상이면 제거하고 true
    public boolean removeLogoutTarget(String sessionId) {
        return sessionId != null && logoutTargetSessions.remove(sessionId);
    }

    // 현재 요청된 세션이 로그아웃 될 대상인지 판단
    public boolean isLogoutTarget(String sessionId) {
        return sessionId != null && logoutTargetSessions.contains(sessionId);
    }

    // 강제 로그아웃 처리가 끝났으면 대상에서 제거
    public void unmarkLogoutTarget(String sessionId) {
        if (sessionId != null) logoutTargetSessions.remove(sessionId);
    }

    // 로그아웃시 호출하여 세션정리
    public void unregister(String userId, String sessionId) {
        String uid = normalize(userId);
        if (uid.isEmpty()) return;

        String mapped = userToSession.get(uid);
        if (sessionId != null && sessionId.equals(mapped)) {
            userToSession.remove(uid);
        }

        if (sessionId != null) {
            sessionToUser.remove(sessionId);
            unmarkLogoutTarget(sessionId);
        }
    }

    // 세션 만료/강제 종료 등 (userId를 모를 때) sessionId로 정리
    public void unregisterBySessionId(String sessionId) {
        if (sessionId == null) return;

        String uid = sessionToUser.remove(sessionId); // sessionId -> userId
        if (uid != null) {
            String mapped = userToSession.get(uid);
            if (sessionId.equals(mapped)) {
                userToSession.remove(uid);
            }
        }
        unmarkLogoutTarget(sessionId);
    }

    // 공백 제거 처리
    private String normalize(String userId) {
        return userId == null ? "" : userId.trim().toUpperCase();
    }
}

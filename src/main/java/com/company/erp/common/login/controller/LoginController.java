package com.company.erp.common.login.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.login.dto.LoginRequest;
import com.company.erp.common.login.service.DuplicateLoginService;
import com.company.erp.common.login.service.LoginService;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.session.SessionUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class LoginController {

    private final LoginService loginService;
    private final DuplicateLoginService duplicateLoginService;

    @SessionIgnore
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest req, HttpServletRequest request) {

        // ip 확보
        String ipAddress = clientIp(request);

        // 서비스에서 인증 + 유저 정보 조회 (comType/vendorCd 포함) + SessionUser 생성까지 끝냄
        SessionUser sessionUser = loginService.login(req, ipAddress);

        // 세션 생성
        HttpSession session = request.getSession(true);

        // 중복 로그인 처리 + registry 등록 + 세션 저장
        duplicateLoginService.handleLoginSuccess(sessionUser, session);

        // 사용자 정보를 함께 반환 (프론트엔드에서 comType으로 라우팅 분기)
        Map<String, Object> userData = new HashMap<>();
        userData.put("userId", sessionUser.getUserId());
        userData.put("comType", sessionUser.getComType()); // B: 구매사, V: 협력사
        userData.put("vendorCd", sessionUser.getVendorCd());
        userData.put("role", sessionUser.getRole());

        return ApiResponse.ok(userData);
    }

    /**
     * 세션 확인 API
     * - 페이지 새로고침 시 세션 유효성 확인
     * - 유효한 세션이면 사용자 정보 반환
     */
    @SessionIgnore
    @GetMapping("/session")
    public ApiResponse<?> getSession(HttpSession session) {
        if (session == null) {
            return ApiResponse.fail("세션이 존재하지 않습니다.");
        }
        SessionUser user = (SessionUser) session.getAttribute(SessionConst.LOGIN_USER);

        if (user == null) {
            return ApiResponse.fail("세션이 존재하지 않습니다.");
        }

        Map<String, Object> userData = new HashMap<>();
        userData.put("userId", user.getUserId());
        userData.put("comType", user.getComType());
        userData.put("vendorCd", user.getVendorCd());
        userData.put("role", user.getRole());

        return ApiResponse.ok(userData);
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank())
            return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}

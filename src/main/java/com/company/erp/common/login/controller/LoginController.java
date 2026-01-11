package com.company.erp.common.login.controller;

import com.company.erp.common.login.dto.LoginRequest;
import com.company.erp.common.login.dto.LoginResponse;
import com.company.erp.common.login.mapper.LoginMapper;
import com.company.erp.common.login.service.DuplicateLoginService;
import com.company.erp.common.login.service.LoginService;
import com.company.erp.common.session.SessionUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class LoginController {

    private final LoginService loginService;
    private final DuplicateLoginService duplicateLoginService;

    // comType/vendorCd 세션 저장하려면 필요
    private final LoginMapper loginMapper;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req, HttpServletRequest request) {

        LoginResponse result = loginService.login(req);
        if (!result.isSuccess()) {
            return result;
        }

        // 성공 시 세션 생성
        HttpSession session = request.getSession(true);

        // SessionUser 생성 (로그인 성공 후에만)
        String ip = clientIp(request);
        SessionUser sessionUser = new SessionUser(req.getUserId(), ip);

        // 중복 로그인 처리 + registry 등록 + 세션 저장 ( 키 = SessionUser.class.getName() )
        duplicateLoginService.handleLoginSuccess(sessionUser, session);

        // (선택) 구매사/협력사 구분이 필요하면 세션에 같이 저장
        Map<String, Object> user = loginMapper.findLoginUser(req.getUserId());
        if (user != null && !user.isEmpty()) {
            session.setAttribute("COM_TYPE", user.get("comType"));   // 'B' or 'V'
            session.setAttribute("VENDOR_CD", user.get("vendorCd")); // 구매사면 null
        }

        return result;
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}

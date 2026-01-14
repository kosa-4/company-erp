package com.company.erp.common.login.service;

import com.company.erp.common.login.dto.LoginRequest;
import com.company.erp.common.login.mapper.LoginMapper;
import com.company.erp.common.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final LoginMapper loginMapper;
    private final PasswordEncoder passwordEncoder;

    public SessionUser login(LoginRequest req, String ipAddress) {

        // ID, PW 비교
        if (req == null
                || req.getUserId() == null || req.getUserId().trim().isEmpty()
                || req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("아이디/비밀번호를 입력해 주세요.");
        }

        String userId = req.getUserId().trim();

        // userId로 조회 후 user 정보 비교
        Map<String, Object> user = loginMapper.findLoginUser(userId);
        if (user == null || user.isEmpty()) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        // 비밀번호 비교
        String hashPw = String.valueOf(user.get("password"));
        if (!passwordEncoder.matches(req.getPassword(), hashPw)) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String comType   = (String) user.get("comType");
        String vendorCd  = (String) user.get("vendorCd");
        String userName  = (String) user.get("userName");
        String deptCd    = (String) user.get("deptCd");
        String deptName  = (String) user.get("deptName");

        if (comType == null || comType.isBlank()) {
            throw new IllegalStateException("로그인 처리 중 오류가 발생했습니다.");
        }

        return new SessionUser(userId, ipAddress, comType, vendorCd, userName, deptCd, deptName);
    }
}

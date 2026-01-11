package com.company.erp.common.login.service;

import com.company.erp.common.login.dto.LoginRequest;
import com.company.erp.common.login.dto.LoginResponse;
import com.company.erp.common.login.mapper.LoginMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final LoginMapper loginMapper;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest req) {

        // ID, PW 체크
        if (req == null
                || req.getUserId() == null || req.getUserId().trim().isEmpty()
                || req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            return LoginResponse.fail("아이디/비밀번호를 입력해 주세요.");
        }

        // 로그인 유저 조회
        Map<String, Object> user = loginMapper.findLoginUser(req.getUserId());
        if (user == null || user.isEmpty()) {
            return LoginResponse.fail("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        Object userPw = user.get("password");
        if (userPw == null) {
            return LoginResponse.fail("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String hashPw = userPw.toString(); // DB에 저장된 비밀번호 해시 값
        String inputPw = req.getPassword();   // 사용자가 입력한 비밀번호

        // 해시 비교 (BCrypt)
        if (!passwordEncoder.matches(inputPw, hashPw)) {
            return LoginResponse.fail("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        return LoginResponse.ok("로그인 성공");
    }
}

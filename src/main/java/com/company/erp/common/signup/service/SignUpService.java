package com.company.erp.common.signup.service;

import com.company.erp.common.login.service.DuplicateLoginService;
import com.company.erp.common.signup.dto.UserDto;
import com.company.erp.common.signup.mapper.SignUpMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SignUpService {
    private SignUpMapper signUpMapper;
    private DuplicateLoginService duplicateLoginService;
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void registerUser(UserDto userDto) {
        boolean existsUserId = signUpMapper.existsUserId(userDto.getUserId());

        // 1. 아이디 중복 체크
        if (existsUserId) {
            // global exception
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 2. 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(userDto.getPassword());
        userDto.setPassword(encryptedPassword);

        // 3. 최종 db 저장
        signUpMapper.insertUser(userDto);

    }
}

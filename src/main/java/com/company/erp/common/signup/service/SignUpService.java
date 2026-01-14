package com.company.erp.common.signup.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.login.service.DuplicateLoginService;
import com.company.erp.common.signup.dto.SignUpDto;
import com.company.erp.common.signup.mapper.SignUpMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SignUpService {
    @Autowired
    private SignUpMapper signUpMapper;
    @Autowired
    private DuplicateLoginService duplicateLoginService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private DocNumService docNumService;

    @Transactional
    public void registerVendorWithManager(SignUpDto signUpDto) {
        boolean existsUserId = signUpMapper.existsUserId(signUpDto.getUserId());

        // 1. 아이디 중복 체크
        if (existsUserId) {
            // global exception
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 2. 변수 설정

        // 2-1. 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(signUpDto.getPassword());
        signUpDto.setPassword(encryptedPassword);

        // 2-2. 요청 코드 생성
        String askNum = docNumService.generateDocNumStr(DocKey.RQ);
        signUpDto.setAskNo(askNum);
        signUpDto.setAskUserNo(askNum);

        // 2-3. 회사 코드 생성
        String vendorCode = docNumService.generateDocNumStr(DocKey.VN);
        signUpDto.setVendorCode(vendorCode);

        // 2-4. 등록자 id 입력
        String userId = signUpDto.getUserId();
        signUpDto.setCreatedBy(userId);

        // 최종 db 저장
        signUpMapper.insertVendor(signUpDto); // 회사가 먼저 생성되는게 논리적으로 올바름
        signUpMapper.insertUser(signUpDto);

    }
}

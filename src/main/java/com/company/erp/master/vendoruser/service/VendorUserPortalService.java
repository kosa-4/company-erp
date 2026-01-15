package com.company.erp.master.vendoruser.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.mapper.VendorUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class VendorUserPortalService {
    @Autowired
    private VendorUserMapper vendorUserMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DocNumService docNumService;

    @Transactional
    public void addVendorUser(VendorUserRegisterDto  vendorUserRegisterDto) {
        
        // 1. 아이디 중복 체크
        boolean existsUserId = vendorUserMapper.existsUserId(vendorUserRegisterDto.getUserId());
        if(existsUserId){
            throw new IllegalArgumentException("이미 요청된 사용자입니다.");
        }
        
        // 2. 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(vendorUserRegisterDto.getPassword());
        vendorUserRegisterDto.setPassword(encryptedPassword);

        // 3. 요청 코드 생성
        String askUserNum = docNumService.generateDocNumStr(DocKey.RQ);
        vendorUserRegisterDto.setAskUserNum(askUserNum);

        // 3. 변수 설정
        vendorUserRegisterDto.setVendorCode("exam"); // 추후 session id로 검색해서 가져올 예정
        vendorUserRegisterDto.setCreatedAt(LocalDate.now());
        vendorUserRegisterDto.setCreatedBy(vendorUserRegisterDto.getUserId());
        vendorUserRegisterDto.setStatus("N");

        // 3. db 저장
        vendorUserMapper.insertUserVNCH_US(vendorUserRegisterDto);
    }

}

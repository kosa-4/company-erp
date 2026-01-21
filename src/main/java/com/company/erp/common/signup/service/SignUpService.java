package com.company.erp.common.signup.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.login.service.DuplicateLoginService;
import com.company.erp.common.signup.dto.SignUpDto;
import com.company.erp.common.signup.mapper.SignUpMapper;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.mapper.VendorMapper;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.mapper.VendorUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class SignUpService {
    @Autowired
    private SignUpMapper signUpMapper;
    @Autowired
    private VendorMapper vendorMapper;
    @Autowired
    private VendorUserMapper vendorUserMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private DocNumService docNumService;

    @Transactional
    public void registerVendorWithManager(SignUpDto signUpDto) {

        // 1. 중복 체크
        // 1-1. 아이디 중복 체크
        boolean existsUserId = vendorUserMapper.existsUserId(signUpDto.getUserId());
        if (existsUserId) {
            // global exception
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 1-2. 사업자 번호 중복 체크
        boolean existsBusinessNo = vendorMapper.existsByBusinessNo(signUpDto.getBusinessNo());
        if (existsBusinessNo) {
            throw new IllegalStateException("이미 존재하는 사업자 번호 입니다.");
        }

        // 2. 변수 설정

        // 2-1. 요청 코드 생성
        String askNum = docNumService.generateDocNumStr(DocKey.OV);
        signUpDto.setAskNo(askNum);
        signUpDto.setAskUserNo(askNum);

        // 2-2. 회사 코드 생성
        String vendorCode = docNumService.generateDocNumStr(DocKey.VN);
        signUpDto.setVendorCode(vendorCode);

        // 2-3. 상태 설정
        signUpDto.setStatus("N");

        // 2-4. 등록자 id 입력
        String userId = signUpDto.getUserId();
        signUpDto.setCreatedBy(userId);

        // 2-5. 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(signUpDto.getPassword());
        signUpDto.setPassword(encryptedPassword);
        
        // 2-6. 요청 타입 설정
        signUpDto.setReqType("I");
    
        // 2-7. dto 전환
        VendorRegisterDto vendorRegisterDto = convertToVendorRegisterDto(signUpDto);
        VendorUserRegisterDto vendorUserRegisterDto = convertToVendorUserRegisterDto(signUpDto);

        // 최종 db 저장
        vendorMapper.insertVendorVNCH(vendorRegisterDto); // 회사가 먼저 생성되는게 논리적으로 올바름
        vendorUserMapper.insertUserVNCH_US(vendorUserRegisterDto);

    }

    // 협력 업체 정보 매핑
    private VendorRegisterDto convertToVendorRegisterDto(SignUpDto signUpDto) {
        VendorRegisterDto vendorRegisterDto = new VendorRegisterDto();

        vendorRegisterDto.setAskNum(signUpDto.getAskNo());
        vendorRegisterDto.setVendorCode(signUpDto.getVendorCode());
        vendorRegisterDto.setVendorName(signUpDto.getVendorName());
        vendorRegisterDto.setVendorNameEng(signUpDto.getVendorNameEn());
        vendorRegisterDto.setBusinessType(signUpDto.getBusinessType());
        vendorRegisterDto.setBusinessNo(signUpDto.getBusinessNo());
        vendorRegisterDto.setCeoName(signUpDto.getCeoName());
        vendorRegisterDto.setZipCode(signUpDto.getZipCode());
        vendorRegisterDto.setAddress(signUpDto.getAddress());
        vendorRegisterDto.setAddressDetail(signUpDto.getAddressDetail());
        vendorRegisterDto.setTel(signUpDto.getPhone());
        vendorRegisterDto.setFax(signUpDto.getFax());
        vendorRegisterDto.setEmail(signUpDto.getEmail());
        vendorRegisterDto.setIndustry(signUpDto.getIndustry());
        vendorRegisterDto.setCreatedBy(signUpDto.getCreatedBy());
        vendorRegisterDto.setStatus(signUpDto.getStatus());
        vendorRegisterDto.setCreatedAt(LocalDateTime.now());
        vendorRegisterDto.setFoundationDate(signUpDto.getFoundationDate());

        return vendorRegisterDto;
    }

    private VendorUserRegisterDto convertToVendorUserRegisterDto(SignUpDto signUpDto) {
        VendorUserRegisterDto vendorUserRegisterDto = new VendorUserRegisterDto();

        vendorUserRegisterDto.setAskUserNum(signUpDto.getAskUserNo());
        vendorUserRegisterDto.setVendorCode(signUpDto.getVendorCode());
        vendorUserRegisterDto.setCreatedAt(LocalDateTime.now());
        vendorUserRegisterDto.setCreatedBy(signUpDto.getCreatedBy());
        vendorUserRegisterDto.setUserId(signUpDto.getUserId());
        vendorUserRegisterDto.setUserName(signUpDto.getUserName());
        vendorUserRegisterDto.setStatus(signUpDto.getStatus());
        vendorUserRegisterDto.setPhone(signUpDto.getPhone());
        vendorUserRegisterDto.setFax(signUpDto.getFax());
        vendorUserRegisterDto.setEmail(signUpDto.getEmail());
        vendorUserRegisterDto.setPassword(signUpDto.getPassword());
        vendorUserRegisterDto.setComType(signUpDto.getComType());
        vendorUserRegisterDto.setReqType(signUpDto.getReqType());

        return vendorUserRegisterDto;
    }
}

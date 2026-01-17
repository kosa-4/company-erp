package com.company.erp.master.vendoruser.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;
import com.company.erp.master.vendoruser.mapper.VendorUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class VendorUserPortalService {
    @Autowired
    private VendorUserMapper vendorUserMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DocNumService docNumService;

    /* 조회 */
    public List<VendorUserListDto> getVendorUserListByVendorCode(VendorUserSearchDto vendorUserSearchDto, String loginId) {
        // 1) 로그인 id로 회사 코드 조회
        String vendorCode = vendorUserMapper.selectVendorCodeByLoginId(loginId);
        
        // 2) 해당 로그인 id로 회사 코드 조회 불가 시
        if(vendorCode==null){
            throw new IllegalArgumentException("해당 사용자의 소속 업체 정보를 찾을 수 없습니다.");
        }
        
        // 3) 회사 코드 db 반환 값으로 설정 (데이터 무결성)
        vendorUserSearchDto.setVendorCode(vendorCode);
        
        // 4) 사용자 조회
        return vendorUserMapper.selectVendorUserListByVendorCode(vendorUserSearchDto);
    }
    
    /* 저장 */
    // 1. 협력 업체 사용자 저장
    @Transactional
    public void addVendorUser(VendorUserRegisterDto  vendorUserRegisterDto, String loginId) {
        
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
        String vendorCode = vendorUserMapper.selectVendorCodeByLoginId(loginId);
        vendorUserRegisterDto.setVendorCode(vendorCode); // 추후 session id로 검색해서 가져올 예정
        vendorUserRegisterDto.setCreatedAt(LocalDate.now());
        vendorUserRegisterDto.setCreatedBy(vendorUserRegisterDto.getUserId());
        vendorUserRegisterDto.setStatus("N");

        // 3. db 저장
        vendorUserMapper.insertUserVNCH_US(vendorUserRegisterDto);
    }

}

package com.company.erp.master.vendor.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.signup.mapper.SignUpMapper;
import com.company.erp.master.vendor.dto.VendorListDto;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.mapper.VendorMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class VendorPortalService {

    @Autowired
    VendorMapper vendorMapper;

    @Autowired
    DocNumService docNumService;

    /* 조회 */
    public VendorListDto getVendorInfo(String loginId){
        // 1) 미승인 업체거나 변경 요청 대기 상태 확인
        VendorListDto vendor = vendorMapper.selectVendorVNCHByLoginId(loginId);
        if (vendor != null){
            vendor.setEditable(false);
            return vendor;
        }
        
        // 2) 마스터 테이블 존재 여부 확인
        vendor = vendorMapper.selectVendorVNGLByLoginId(loginId);
        if (vendor != null){
            vendor.setEditable(true);
        } else{
            throw new IllegalStateException("존재하지 않는 회사입니다.");
        }
        return vendor;
    }

    /* 변경 요청 */

    @Transactional
    public void requestVendorChange(VendorRegisterDto vendorRegisterDto, String loginId) {
        // 1. 변수 설정

        // 1-1. 요청 코드 생성
        String askNum = docNumService.generateDocNumStr(DocKey.RQ);
        vendorRegisterDto.setAskNum(askNum);

        // 1-2. 수정자 id 및 날짜 입력
        vendorRegisterDto.setCreatedBy(loginId);
        vendorRegisterDto.setCreatedAt(LocalDateTime.now());

        // 1-3. 상태 설정
        vendorRegisterDto.setStatus("C");
        
        // 최종 DB 저장
        vendorMapper.insertVendorVNCH(vendorRegisterDto);
    }
}

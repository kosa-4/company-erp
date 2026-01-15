package com.company.erp.master.vendor.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.signup.mapper.SignUpMapper;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.mapper.VendorMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class VendorPortalService {

    @Autowired
    VendorMapper vendorMapper;

    @Autowired
    DocNumService docNumService;

    /* 변경 요청 */

    @Transactional
    public void requestVendorChange(VendorRegisterDto vendorRegisterDto, String sessionId) {
        // 1. 변수 설정

        // 1-1. 요청 코드 생성
        String askNum = docNumService.generateDocNumStr(DocKey.RQ);
        vendorRegisterDto.setAskNum(askNum);

        // 1-2. 수정자 id 및 날짜 입력
        vendorRegisterDto.setCreatedBy(sessionId);
        vendorRegisterDto.setCreatedAt(LocalDate.now());

        // 1-3. 상태 설정
        vendorRegisterDto.setStatus("C");
        
        // 최종 DB 저장
        vendorMapper.insertVendorVNCH(vendorRegisterDto);
    }
}

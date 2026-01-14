package com.company.erp.master.vendor.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.master.vendor.dto.*;
import com.company.erp.master.vendor.mapper.VendorMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class VendorService {

    @Autowired
    VendorMapper vendorMapper;

    @Autowired
    DocNumService docNumService;

    /* 조회 */
    public VendorResponseDto<VendorListDto> getVendorList(VendorSearchDto vendorSearchDto) {
        // 1. 총 협력사 수 계산
        // 2. 총 페이지 계산
        // 3. Dto 반환
        return new VendorResponseDto<VendorListDto>(
                vendorMapper.selectVendorList(vendorSearchDto),
                vendorSearchDto.getPage(),
                vendorSearchDto.getPageSize(),
                1,
                1
        );
    }

    /* 저장 */
    // 1. 구매사에서 직접 등록 -> 바로 승인 후 마스터 테이블로 이동
    @Transactional
    public void registerVendorInternal(VendorRegisterDto vendorRegisterDto, String sessionId) {

        // 1. 중복 체크
        boolean existsBusinessNo = vendorMapper.existsByBusinessNo(vendorRegisterDto.getBusinessNo());

        if(existsBusinessNo) {
            throw new IllegalStateException("동일한 사업자 번호가 존재합니다.");
        }

        // 2. 체번 및 입력 값 입력
        String vendorCode = docNumService.generateDocNumStr(DocKey.VN);
        vendorRegisterDto.setVendorCode(vendorCode);
        vendorRegisterDto.setCreatedBy(sessionId);
        vendorRegisterDto.setCreatedAt(LocalDate.now());
        vendorRegisterDto.setSignDate(LocalDate.now());

        // 3. 마스터 테이블에 저장
        vendorMapper.insertVendorVNGL(vendorRegisterDto);
    }

    // 2. 구매사에서 승인
    @Transactional
    public void approveVendor(String askNum, String sessionId) {
        
        // 1) 선택된 협력사 정보 조회
        VendorRegisterDto vendor = vendorMapper.selectVendorByAskNum(askNum);
        if(vendor == null) {
            throw new IllegalStateException("해당 협력사가 존재하지 않습니다");
        }

        // 2) 입력값 설정
        vendor.setModifiedBy(sessionId);
        vendor.setModifiedAt(LocalDate.now());
        vendor.setSignDate(LocalDate.now());
        
        // 3) 마스터 테이블 추가
        vendorMapper.insertVendorVNGL(vendor);

        // 4) 대기 테이블 업데이트
        VendorUpdateDto vendorUpdateDto = new VendorUpdateDto(); // 상황에 따라 필요한 값이 다르므로 di 불가
        vendorUpdateDto.setModifiedAt(LocalDate.now());
        vendorUpdateDto.setModifiedBy(sessionId);
        vendorUpdateDto.setAskNum(askNum);
        vendorUpdateDto.setDelFlag("Y");
        vendorUpdateDto.setStatus("A");
        vendorUpdateDto.setSignUserId(sessionId);

        vendorMapper.updateVNCHByAskNum(vendorUpdateDto);
    }
    
    // 3. 구매사에서 반려
    @Transactional
    public void rejectVendor(VendorUpdateDto vendorUpdateDto, String sessionId) {
        // 1) 입력값 설정
        vendorUpdateDto.setModifiedAt(LocalDate.now());
        vendorUpdateDto.setModifiedBy(sessionId);
        vendorUpdateDto.setSignUserId(sessionId);
        vendorUpdateDto.setStatus("R");

        // 2) 대기 테이블 업데이트
        vendorMapper.updateVNCHByAskNum(vendorUpdateDto);
    }
}

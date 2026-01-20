package com.company.erp.master.vendor.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.file.exception.FileException;
import com.company.erp.master.vendor.dto.*;
import com.company.erp.master.vendor.mapper.VendorMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

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
    
    // 2. 회사 코드로 파일 번호 조회
    public List<String> getFileNumByVendorCode(String vendorCode) {
        List<String> fileNumList = vendorMapper.selectFileNumByVendorCode(vendorCode);
//        if(fileNumList.isEmpty()){
//            throw new FileException("검색 결과가 없습니다.");
//        }
        return (fileNumList != null) ?  fileNumList : new ArrayList<>();
    }

    /* 저장 */
    // 1. 구매사에서 직접 등록 -> 바로 승인 후 마스터 테이블로 이동
    @Transactional
    public String registerVendorInternal(VendorRegisterDto vendorRegisterDto, String sessionId) {

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

        // 4. 파일 저장 시 사용할 회사 코드 반환
        return vendorCode;
    }

    // 2. 구매사에서 승인
    @Transactional
    public void approveVendor(List<VendorRegisterDto> vendorRegisterDtoList, String loginId) {

        // 1) 단일 dto 반환 (일괄 처리 건수가 많지 않으므로 서비스 레이어에서 for문으로 처리)
        for(VendorRegisterDto dto : vendorRegisterDtoList) {
            String askNum = dto.getAskNum();
            // 2) 선택된 협력사 정보 조회
            VendorRegisterDto vendor = vendorMapper.selectVendorByAskNum(askNum);

            if(vendor == null) {
                throw new IllegalStateException("해당 협력사가 존재하지 않습니다");
            }
            // 3) 공통값 입력
            vendor.setModifiedBy(loginId);
            vendor.setModifiedAt(LocalDate.now());
            vendor.setSignDate(LocalDate.now());
            
            // 4) 상태값 확인
            String status = vendor.getStatus();
            switch (status) {

                case "N": // 신규 등록 시
                    vendorMapper.insertVendorVNGL(vendor);
                    break;

                case "C": // 변경 요청 시
                    vendorMapper.updateVNGLByVendorCode(vendor);
                    break;

                default:
                    throw new IllegalStateException("승인 가능한 상태가 아닙니다.");
            }

            // 6) 대기 테이블 업데이트
            VendorUpdateDto vendorUpdateDto = new VendorUpdateDto(); // 상황에 따라 필요한 값이 다르므로 di 불가
            vendorUpdateDto.setModifiedAt(LocalDateTime.now());
            vendorUpdateDto.setModifiedBy(loginId);
            vendorUpdateDto.setAskNum(askNum); // where 용
            vendorUpdateDto.setDelFlag("N");
            vendorUpdateDto.setStatus("A");
            vendorUpdateDto.setSignUserId(loginId);

            vendorMapper.updateVNCHByAskNum(vendorUpdateDto);
        }
    }
    
    // 3. 구매사에서 반려
    @Transactional
    public void rejectVendor(List<VendorUpdateDto> vendorUpdateDtoList, String loginId) {
        // 1) 단일 dto 반환
        for(VendorUpdateDto dto : vendorUpdateDtoList) {

            // 2) 입력값 설정
            dto.setModifiedAt(LocalDateTime.now());
            dto.setModifiedBy(loginId);
            dto.setSignUserId(loginId);
            dto.setStatus("R");

            // 3) 대기 테이블 업데이트
            vendorMapper.updateVNCHByAskNum(dto);
        }

    }
}

package com.company.erp.master.vendor.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.master.vendor.dto.VendorListDto;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.dto.VendorResponseDto;
import com.company.erp.master.vendor.dto.VendorSearchDto;
import com.company.erp.master.vendor.mapper.VendorMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public void registerVendorInternal(VendorRegisterDto vendorRegisterDto) {

        // 1. 중복 체크
        boolean existsBusinessNo = vendorMapper.existsByBusinessNo(vendorRegisterDto.getBusinessNo());

        if(existsBusinessNo) {
            throw new IllegalStateException("동일한 사업자 번호가 존재합니다.");
        }

        // 2. 체번 및 입력 값 입력
        String vendorCode = docNumService.generateDocNumStr(DocKey.VN);
        vendorRegisterDto.setVendorCode(vendorCode);
        vendorRegisterDto.setStatus("A"); // 즉시 승인 상태
        vendorRegisterDto.setCreatedBy("추후 수정");

        // 3. 마스터 테이블에 저장
        vendorMapper.insertVendorVNGL(vendorRegisterDto);
    }
}

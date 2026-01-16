package com.company.erp.master.vendor.mapper;

import com.company.erp.master.vendor.dto.VendorListDto;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.dto.VendorSearchDto;
import com.company.erp.master.vendor.dto.VendorUpdateDto;

import java.util.List;

public interface VendorMapper {
    /* 조회 */
    // 1.전체 조회
    List<VendorListDto> selectVendorList(VendorSearchDto vendorSearchDto);

    // 2.단일 조회
    VendorRegisterDto selectVendorByAskNum(String askNum);

    // 3. 사업자 번호 중복 조회
    boolean existsByBusinessNo(String businessNo);

    /* 저장 */
    // 1. 마스터 테이블 저장
    void insertVendorVNGL(VendorRegisterDto vendorRegisterDto);
    
    // 2. 대기 테이블 저장
    void insertVendorVNCH(VendorRegisterDto vendorRegisterDto);

    /* 수정 */
    // 1. 대기 테이블 업데이트
    void updateVNCHByAskNum(VendorUpdateDto vendorUpdateDto);

}

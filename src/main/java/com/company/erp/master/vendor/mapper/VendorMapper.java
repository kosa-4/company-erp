package com.company.erp.master.vendor.mapper;

import com.company.erp.master.vendor.dto.VendorListDto;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.dto.VendorSearchDto;
import com.company.erp.master.vendor.dto.VendorUpdateDto;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;

import java.util.List;

public interface VendorMapper {
    /* 조회 */
    // 1.전체 조회
    List<VendorListDto> selectVendorList(VendorSearchDto vendorSearchDto);

    // 2.요청 번호로 단일 조회
    VendorRegisterDto selectVendorByAskNum(String askNum);

    // 3. 사업자 번호 중복 조회
    boolean existsByBusinessNo(String businessNo);

    // 4. 로그인한 id로 대기 테이블 단일 조회
    VendorListDto selectVendorVNCHByLoginId(String loginId);

    // 5. 로그인한 id로 마스터 테이블 단일 조회
    VendorListDto selectVendorVNGLByLoginId(String loginId);
    
    // 6. 대기 상태 여부 확인
    int countPending(String loginId);

    // 7. 회사 코드로 파일 번호 조회
    List<String> selectFileNumByVendorCode (String vendorCode);
    
    // 8. 회사 코드로 회사 정보 조회
    VendorListDto selectVendorByVendorCode(String vendorCode);

    /* 수정 */
    void updateVendor(VendorUpdateDto vendorUpdateDto);

    /* 저장 */
    // 1. 마스터 테이블 저장
    void insertVendorVNGL(VendorRegisterDto vendorRegisterDto);
    
    // 2. 대기 테이블 저장
    void insertVendorVNCH(VendorRegisterDto vendorRegisterDto);

    /* 수정 */
    // 1. 마스터 테이블 업데이트
    void updateVNGLByVendorCode(VendorRegisterDto vendorRegisterDto);
    // 2. 대기 테이블 업데이트
    void updateVNCHByAskNum(VendorUpdateDto vendorUpdateDto);

}

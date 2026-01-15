package com.company.erp.master.vendoruser.mapper;

import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;
import com.company.erp.master.vendoruser.dto.VendorUserUpdateDto;

import java.util.List;

public interface VendorUserMapper {
    // === 구매사 === //
    /* 조회 */
    // 1. 협력 업체 사용자 전체 조회
    List<VendorUserListDto> selectVendorUserList(VendorUserSearchDto VendorUserSearchDto);
    // 2. 협력 업체 사용자 단일 조회
    VendorUserRegisterDto selectVendorUserByAskUserNum(String askUserNum);
    
    /* 저장 */
    // 1. 마스터 테이블 저장
    void insertUserVN_USER(VendorUserRegisterDto vendorUserRegisterDto);

    /* 수정 */
    // 1. 대기 테이블 업데이트
    void updateVNCH_USByAskUserNum(VendorUserUpdateDto vendorUserUpdateDto);
    
    // === 협력사 === //
    /* 조회 */
    // 1. 아이디 중복 검사
    boolean existsUserId(String userId);

    /* 저장 */
    // 1. 대기 테이블 저장
    void insertUserVNCH_US(VendorUserRegisterDto vendorUserRegisterDto);
}

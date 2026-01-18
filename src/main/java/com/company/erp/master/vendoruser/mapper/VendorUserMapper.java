package com.company.erp.master.vendoruser.mapper;

import com.company.erp.master.vendor.dto.VendorListDto;
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
    // 3. 협력 업체 사용자 마스터 테이블 단일 조회
    int countVendorUsersByUserId(String userId);
    // 4. 협력사 사용자 과거 이력 조회
    int countVendorUserHistoryByUserId(String userId);
    
    /* 저장 */
    // 1. 마스터 테이블 저장
    void insertUserVN_USER(VendorUserRegisterDto vendorUserRegisterDto);

    /* 수정 */
    // 1. 대기 테이블 업데이트
    void updateVNCH_USByAskUserNum(VendorUserUpdateDto vendorUserUpdateDto);
    // 2. 마스터 테이블 업데이트
    void updateVN_USERByUserId(VendorUserUpdateDto  vendorUserUpdateDto);
    
    // === 협력사 === //
    /* 조회 */
    // 1. 아이디 중복 검사
    boolean existsUserId(String userId);
    // 2. 회사 코드로 조회
    List<VendorUserListDto> selectVendorUserListByVendorCode(VendorUserSearchDto VendorUserSearchDto);
    // 3. 로그인 id로 회사 코드 조회
    String selectVendorCodeByLoginId(String loginId);
    // 4. 관리자 수 조회
    int countVendorUsers(String vendorCode);
    // 5. 승인 대기 조회
    int countWaitRequest(String userId);
    // 6. 진행 중인 프로세스 조회
    int countActiveProcess(String userId);
    // 7. user id로 대기 테이블 조회
    VendorUserListDto selectVendorUserVNCH_USByUserId(String userId);

    /* 저장 */
    // 1. 대기 테이블 저장
    void insertUserVNCH_US(VendorUserRegisterDto vendorUserRegisterDto);
}

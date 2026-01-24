package com.company.erp.master.vendor.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.session.SessionUser;
import com.company.erp.common.signup.mapper.SignUpMapper;
import com.company.erp.master.vendor.dto.VendorListDto;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.mapper.VendorMapper;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.mapper.VendorUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class VendorPortalService {

    @Autowired
    VendorMapper vendorMapper;

    @Autowired
    VendorUserMapper vendorUserMapper;

    @Autowired
    DocNumService docNumService;

    /* 조회 */
    // 1. 협력 업체 변경 신청 조회 화면
    public VendorListDto getVendorInfo(String loginId){

        // 1) 최신 승인 대기/변경 요청 조회
        VendorListDto pendingVendor = vendorMapper.selectVendorVNCHByLoginId(loginId);

        if (pendingVendor != null){
            pendingVendor.setEditable(false);
            // 수정 요청 후 대기 상태 시 보여줄 값
            return pendingVendor;
        }
        
        // 2) 마스터 테이블 조회
        VendorListDto masterVendor = vendorMapper.selectVendorVNGLByLoginId(loginId);

        if (masterVendor == null){
            throw new IllegalStateException("존재하지 않는 회사입니다.");
        }

        boolean editable = isEditable(loginId, masterVendor);

        masterVendor.setEditable(editable);
        // 수정 요청 전 협력 업체 정보 보여줄 값
        return masterVendor;
    }
    // 2. 회사 코드로 파일 번호 조회
    public List<String> getFileNumByVendorCode(String vendorCode, SessionUser loginUser) {

        List<String> fileNumList = vendorMapper.selectFileNumByVendorCode(vendorCode);

        return (fileNumList != null) ?  fileNumList : new ArrayList<>();
    }

    private boolean isEditable(String loginId, VendorListDto vendor) {
        // 1. 사용자 정보 조회
        HashMap<String, String> userInfo = vendorUserMapper.selectRoleAndVendorCodeByUserId(loginId);

        if(userInfo == null){
            throw new NoSuchElementException("사용자를 조회할 수 없습니다.");
        }
        
        // 2. 사용자 권한 확인
        String role = userInfo.get("role");
        if(role == null) return false;
        return role.equals("VENDOR") && vendor != null;
    }
    // 3. 요청 번호로 회사 코드 조회
    public String getVendorCodeByAskNum(String askNum){
        String vendorCode = vendorMapper.selectVendorCodeByAskNum(askNum);
        if(vendorCode == null ||  vendorCode.isEmpty()){
            throw new NoSuchElementException("회사가 존재하지 않습니다.");
        }
        return vendorCode;
    }

    /* 변경 요청 */
    // 1. 협력 업체 변경 신청
    @Transactional
    public String requestVendorChange(VendorRegisterDto vendorRegisterDto, String loginId) {

        HashMap<String, String> userInfo = vendorUserMapper.selectRoleAndVendorCodeByUserId(loginId);

        // 1. 사용자 존재 여부 확인
        if(userInfo == null){
            throw new NoSuchElementException("사용자를 조회할 수 없습니다.");
        }

        String role = userInfo.get("role");
        String vendorCode = userInfo.get("vendorCode");

        // 2. 권한 확인
        if(!"VENDOR".equals(role)){
            throw new IllegalStateException("수정 권한이 없습니다.");
        }

        // 3. 업체 정보 확인
        if(vendorCode == null){
            throw new IllegalStateException("협력사 정보가 없습니다.");
        }

        // 3. 대기 테이블 삽입
        // 3-1. 요청 코드 생성
        String askNum = docNumService.generateDocNumStr(DocKey.MD);
        vendorRegisterDto.setAskNum(askNum);

        // 3-2. 수정자 id 및 날짜 입력
        vendorRegisterDto.setCreatedBy(loginId);
        vendorRegisterDto.setCreatedAt(LocalDateTime.now());

        // 3-3. 상태 설정
        vendorRegisterDto.setStatus("C");
        
        // 3-4. 회사 코드 강제 입력
        vendorRegisterDto.setVendorCode(vendorCode);

        int inserted = vendorMapper.insertVendorVNCH(vendorRegisterDto);

        // 4. 삽입 조건으로 상태값 검증 -> 롤백 (원자성 체크)
        if(inserted == 0){
            throw new IllegalStateException("이미 승인 대기 중인 상태 입니다.");
        }

        return askNum;
    }
}

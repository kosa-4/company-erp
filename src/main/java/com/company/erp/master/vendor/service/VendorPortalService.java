package com.company.erp.master.vendor.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
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
        System.out.println(editable);
        // 수정 요청 전 협력 업체 정보 보여줄 값
        return masterVendor;
    }

    private boolean isEditable(String loginId, VendorListDto vendor) {
        String role = vendorUserMapper.selectRoleByUserId(loginId);
        if(role == null) return false;
        return role.equals("VENDOR") && vendor != null;
    }

    /* 변경 요청 */
    // 1. 협력 업체 변경 신청
    @Transactional
    public void requestVendorChange(VendorRegisterDto vendorRegisterDto, String loginId) {

        String role = vendorUserMapper.selectRoleByUserId(loginId);

        // 1. 사용자 존재 여부 확인
        if(role == null){
            throw new NoSuchElementException("사용자를 조회할 수 없습니다.");
        }
        
        // 2. 권한 확인
        if(!role.equals("VENDOR")){
            throw new IllegalStateException("수정 권한이 없습니다.");
        }

        // 3. 승인 대기 여부 확인
        int pending = vendorMapper.countPending(loginId);
        if(pending > 0){
            throw new IllegalStateException("승인 요청 상태일 시 수정할 수 없습니다.");
        }

        // 4. 조건 충족 시
        // 4-1. 요청 코드 생성
        String askNum = docNumService.generateDocNumStr(DocKey.RQ);
        vendorRegisterDto.setAskNum(askNum);

        // 4-2. 수정자 id 및 날짜 입력
        vendorRegisterDto.setCreatedBy(loginId);
        vendorRegisterDto.setCreatedAt(LocalDateTime.now());

        // 4-3. 상태 설정
        vendorRegisterDto.setStatus("C");
        
        // 최종 DB 저장
        vendorMapper.insertVendorVNCH(vendorRegisterDto);
    }
}

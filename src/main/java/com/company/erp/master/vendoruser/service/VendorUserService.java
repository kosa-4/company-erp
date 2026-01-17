package com.company.erp.master.vendoruser.service;

import com.company.erp.common.session.SessionUser;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;
import com.company.erp.master.vendoruser.dto.VendorUserUpdateDto;
import com.company.erp.master.vendoruser.mapper.VendorUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.util.List;

@Service
public class VendorUserService {
    @Autowired
    VendorUserMapper vendorUserMapper;

    /* 조회 */
    public List<VendorUserListDto> getVendorUserList(VendorUserSearchDto vendorUserSearchDto) {
        return vendorUserMapper.selectVendorUserList(vendorUserSearchDto);
    }
    
    /* 저장 */
    // 1. 구매사에서 승인
    @Transactional
    public void approveVendorUser(List<VendorUserRegisterDto> vendorUserRegisterDtoList, String loginId) {
        // 1) 단일 dto 반환
        for(VendorUserRegisterDto dto : vendorUserRegisterDtoList){
            // 2) 사용자 존재 여부 확인
            String askUserNum = dto.getAskUserNum();
            VendorUserRegisterDto vendorUser = vendorUserMapper.selectVendorUserByAskUserNum(askUserNum);

            if(vendorUser == null){
                throw new IllegalStateException("해당 사용자가 존재하지 않습니다.");
            }

            // 3) 상태값 확인
            String status = vendorUser.getStatus();
            if(!"C".equals(status) && !"N".equals(status)){
                throw new IllegalStateException("선택 가능한 상태가 아닙니다.");
            }

            // 4) 입력값 설정
            dto.setCreatedAt(LocalDate.now());
            dto.setCreatedBy(loginId);
            dto.setModifiedAt(LocalDate.now());
            dto.setModifiedBy(loginId);
            dto.setSignDate(LocalDate.now());
            dto.setPassword(vendorUser.getPassword());

            // 5) 요청 타입에 따라 분기
            String req = dto.getReqType();
            switch(req){
                
                case "I": // 5-1. 등록
                    // 5-1-1) 관리자 권한 부여 설정
                    int countVendorUsers = vendorUserMapper.countVendorUsersByVendorCode(vendorUser.getVendorCode());
                    if(countVendorUsers == 0){
                        dto.setRole("ADMIN");
                    } else{
                        dto.setRole("VENDOR");
                    }
                    break;
                case "D": // 5-2. 삭제
                case "U": // 5-3. 수정
            }

            vendorUserMapper.insertUserVN_USER(dto);
            
            // 6) 대기 테이블 업데이트
            VendorUserUpdateDto vendorUserUpdateDto = new VendorUserUpdateDto();
            vendorUserUpdateDto.setModifiedAt(LocalDate.now());
            vendorUserUpdateDto.setModifiedBy(loginId);
            vendorUserUpdateDto.setAskUserNum(askUserNum);
            vendorUserUpdateDto.setDelFlag("N");
            vendorUserUpdateDto.setStatus("A");

            vendorUserMapper.updateVNCH_USByAskUserNum(vendorUserUpdateDto);
        }
    }

    // 2. 구매사에서 반려
    @Transactional
    public void rejectVendorUser(List<VendorUserUpdateDto> vendorUserUpdateDtoList, String loginId) {
        // 1) 단일 dto 반환
        for(VendorUserUpdateDto dto : vendorUserUpdateDtoList){
            // 1) 사용자 존재 여부 확인
            String askUserNum = dto.getAskUserNum();
            VendorUserRegisterDto vendorUser = vendorUserMapper.selectVendorUserByAskUserNum(askUserNum);

            if(vendorUser == null){
               throw new IllegalStateException("해당 사용자가 존재하지 않습니다.");
            }

            // 2) 상태값 확인
            String status = vendorUser.getStatus();

            if(!"C".equals(status) && !"N".equals(status)){
                throw new IllegalStateException("반려 가능한 상태가 아닙니다.");
            }

            // 3) 입력값 설정
            dto.setModifiedAt(LocalDate.now());
            dto.setModifiedBy(String.valueOf(loginId));
            dto.setStatus("R");
            
            // 4) 대기 테이블 업데이트
            vendorUserMapper.updateVNCH_USByAskUserNum(dto);
        }
    }
    
}

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
import java.time.LocalDateTime;
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
            LocalDateTime now = LocalDateTime.now();
            VendorUserListDto vendorUser = vendorUserMapper.selectVendorUserByAskUserNum(askUserNum);

            if(vendorUser == null){
                throw new IllegalStateException("해당 사용자가 존재하지 않습니다.");
            }

            // 3) 상태값 확인
            String status = vendorUser.getStatus();
            if(!"C".equals(status) && !"N".equals(status)){
                throw new IllegalStateException("선택 가능한 상태가 아닙니다.");
            }

            // 5) 요청 타입에 따라 분기
            String req = vendorUser.getReqType();
            VendorUserUpdateDto updateDto = new VendorUserUpdateDto();
            switch(req){

                case "I": // 5-1. 등록

                    // 재가입 여부 확인
                    int historyCount = vendorUserMapper.countVendorUserHistoryByUserId(vendorUser.getUserId());
                    if(historyCount > 0){

                        setCommonFieldsUpdateDto(updateDto,loginId,askUserNum,vendorUser,now, "A");

                        vendorUserMapper.updateVN_USERByUserId(updateDto);
                    } else{
                        dto.setCreatedAt(now);
                        dto.setCreatedBy(loginId);
                        dto.setModifiedAt(LocalDateTime.now());
                        dto.setModifiedBy(loginId);
                        dto.setSignDate(LocalDateTime.now());
                        dto.setPassword(vendorUser.getPassword());
                        dto.setRole("VENDOR");

                        vendorUserMapper.insertUserVN_USER(dto);
                    }
                    // 6) 대기 테이블 업데이트

                        setCommonFieldsUpdateDto(updateDto,loginId,askUserNum,vendorUser,now, "A");

                    vendorUserMapper.updateVNCH_USByAskUserNum(updateDto);
                    break;
                case "D": // 5-2. 삭제
                    // 1) 마스터 / 대기 테이블 업데이트
                    setCommonFieldsUpdateDto(updateDto,loginId,askUserNum,vendorUser,now, "R");

                    vendorUserMapper.updateVN_USERByUserId(updateDto);
                    vendorUserMapper.updateVNCH_USByAskUserNum(updateDto);
                    break;
                case "U": // 5-3. 수정
                    // 1) 마스터 테이블 업데이트
                    setCommonFieldsUpdateDto(updateDto,loginId,askUserNum,vendorUser,now, "A");

                    updateDto.setUserName(vendorUser.getUserName());
                    updateDto.setEmail(vendorUser.getEmail());
                    updateDto.setPhone(vendorUser.getPhone());
                    
                    // 프론트에서는 비밀번호 값을 보내지 않음
                    // 대기 테이블에 변경된 비밀번호가 존재할 시에만 업데이트
                    // 비밀번호 변경 미입력 시 대기 테이블에 null로 저장됨
                    if(vendorUser.getPassword() != null && !vendorUser.getPassword().isEmpty()){
                        updateDto.setPassword(vendorUser.getPassword());
                    }

                    vendorUserMapper.updateVN_USERByUserId(updateDto);

                    // 2) 대기 테이블 업데이트
                    vendorUserMapper.updateVNCH_USByAskUserNum(updateDto);
                    break;
            }
        }
    }

    // updateDto 공통 필드 세팅
    private void setCommonFieldsUpdateDto(
            VendorUserUpdateDto dto,
            String loginId,
            String askUserNum,
            VendorUserListDto vendorUser,
            LocalDateTime now,
            String status
            ){

        dto.setModifiedAt(now);
        dto.setModifiedBy(loginId);
        dto.setAskUserNum(askUserNum);
        dto.setStatus(status);
        dto.setUserId(vendorUser.getUserId());
        dto.setDelFlag("N");
    }

    // 2. 구매사에서 반려
    @Transactional
    public void rejectVendorUser(List<VendorUserUpdateDto> vendorUserUpdateDtoList, String loginId) {
        // 1) 단일 dto 반환
        for(VendorUserUpdateDto dto : vendorUserUpdateDtoList){
            // 1) 사용자 존재 여부 확인
            String askUserNum = dto.getAskUserNum();
            VendorUserListDto vendorUser = vendorUserMapper.selectVendorUserByAskUserNum(askUserNum);

            if(vendorUser == null){
               throw new IllegalStateException("해당 사용자가 존재하지 않습니다.");
            }

            // 2) 상태값 확인
            String status = vendorUser.getStatus();

            if(!"C".equals(status) && !"N".equals(status)){
                throw new IllegalStateException("반려 가능한 상태가 아닙니다.");
            }
            dto.setModifiedAt(LocalDateTime.now());
            dto.setModifiedBy(String.valueOf(loginId));
            dto.setStatus("R");

            if(vendorUser.getReqType().equals("D")){
                dto.setDelFlag("N");
            }
            vendorUserMapper.updateVNCH_USByAskUserNum(dto);

        }
    }
}

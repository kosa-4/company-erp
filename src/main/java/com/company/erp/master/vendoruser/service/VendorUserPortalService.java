package com.company.erp.master.vendoruser.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;
import com.company.erp.master.vendoruser.dto.VendorUserUpdateDto;
import com.company.erp.master.vendoruser.mapper.VendorUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class VendorUserPortalService {
    @Autowired
    private VendorUserMapper vendorUserMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DocNumService docNumService;

    /* 조회 */
    public List<VendorUserListDto> getVendorUserListByVendorCode(VendorUserSearchDto vendorUserSearchDto, String loginId) {
        // 1) 로그인 id로 회사 코드 조회
        String vendorCode = vendorUserMapper.selectVendorCodeByLoginId(loginId);
        
        // 2) 해당 로그인 id로 회사 코드 조회 불가 시
        if(vendorCode==null){
            throw new IllegalArgumentException("해당 사용자의 소속 업체 정보를 찾을 수 없습니다.");
        }
        
        // 3) 회사 코드 db 반환 값으로 설정 (데이터 무결성)
        vendorUserSearchDto.setVendorCode(vendorCode);
        
        // 4) 사용자 조회
        return vendorUserMapper.selectVendorUserListByVendorCode(vendorUserSearchDto);
    }
    
    /* 저장 */
    // 1. 협력 업체 사용자 저장
    @Transactional
    public void addVendorUser(VendorUserRegisterDto  vendorUserRegisterDto, String loginId) {
        
        // 1. 아이디 중복 체크
        boolean existsUserId = vendorUserMapper.existsUserId(vendorUserRegisterDto.getUserId());
        if(existsUserId){
            throw new IllegalArgumentException("이미 요청된 사용자입니다.");
        }
        
        // 2. 비밀번호 암호화
        String encryptedPassword = passwordEncoder.encode(vendorUserRegisterDto.getPassword());
        vendorUserRegisterDto.setPassword(encryptedPassword);

        // 3. 요청 코드 생성
        String askUserNum = docNumService.generateDocNumStr(DocKey.RQ);
        vendorUserRegisterDto.setAskUserNum(askUserNum);

        // 3. 변수 설정
        String vendorCode = vendorUserMapper.selectVendorCodeByLoginId(loginId);
        vendorUserRegisterDto.setVendorCode(vendorCode); // 추후 session id로 검색해서 가져올 예정
        vendorUserRegisterDto.setCreatedAt(LocalDate.now());
        vendorUserRegisterDto.setCreatedBy(vendorUserRegisterDto.getUserId());
        vendorUserRegisterDto.setStatus("N");
        vendorUserRegisterDto.setReqType("I");

        // 3. db 저장
        vendorUserMapper.insertUserVNCH_US(vendorUserRegisterDto);
    }

    /* 수정 */

    @Transactional
    public void updateVendorUser(
            VendorUserRegisterDto vendorUserRegisterDto,
            SessionUser loginUser) {
        String userId = vendorUserRegisterDto.getUserId();
        String loginId = loginUser.getUserId();

        // !프론트 값 신뢰 금지
        VendorUserListDto vendorUser = vendorUserMapper.selectVendorUserVNCH_USByUserId(userId);

        // 1) 정보 존재 여부 확인
        if (vendorUser == null) {
            throw new IllegalStateException("사용자 정보가 없습니다.");
        }
        
        // 2) 요청 여부 확인
        int existsRequest = vendorUserMapper.countWaitRequest(userId);
        if (existsRequest > 0) {
            throw new IllegalStateException("이미 요청된 id 입니다.");
        }

        // 2) 같은 협력체 소속 사용자만 수정 가능 (프론트 값 신뢰 금지, db에서 조회 후 입력)
        if(!loginUser.getVendorCd().equals(vendorUser.getVendorCode()) ){
            throw new IllegalStateException("타업체 사용자는 수정할 수 없습니다.");
        }

        // 3) 비밀 번호 암호화
        String encryptedPassword = null;
        String password = vendorUserRegisterDto.getPassword();
        if(password != null  && password.isEmpty()){
            encryptedPassword = passwordEncoder.encode(vendorUserRegisterDto.getPassword());
        }

        // 4) 승인 상태 확인
        // 승인 대기 상태('C', 'N')일 시 수정 불가
        String status = vendorUser.getStatus();

        switch (status) {
            case "A": // 4-1. 승인 상태일 시
                
                // 4-1-1) 입력 값 저장
                String askUserNum = docNumService.generateDocNumStr(DocKey.RQ);
                vendorUserRegisterDto.setAskUserNum(askUserNum);
                vendorUserRegisterDto.setVendorCode(vendorUser.getVendorCode());
                vendorUserRegisterDto.setCreatedAt(LocalDate.now());
                vendorUserRegisterDto.setCreatedBy(loginId);
                vendorUserRegisterDto.setStatus("C");
                vendorUserRegisterDto.setReqType("U");

                encryptedPassword = encryptedPassword  != null ? encryptedPassword : vendorUser.getPassword();
                vendorUserRegisterDto.setPassword(encryptedPassword);

                vendorUserMapper.insertUserVNCH_US(vendorUserRegisterDto);
                break;

            case "R": // 4-2. 반려 상태일 시

                // 4-2-1) 업데이트 dto 생성
                VendorUserUpdateDto updateDto = new VendorUserUpdateDto();
                updateDto.setAskUserNum(vendorUser.getAskUserNum());
                updateDto.setModifiedAt(LocalDate.now());
                updateDto.setModifiedBy(loginId);
                updateDto.setStatus("C");
                updateDto.setReqType("U");
                updateDto.setUserId(vendorUserRegisterDto.getUserId());
                updateDto.setEmail(vendorUserRegisterDto.getEmail());
                updateDto.setPhone(vendorUserRegisterDto.getPhone());
                updateDto.setPassword(encryptedPassword);

                vendorUserMapper.updateVNCH_USByAskUserNum(updateDto);
                break;

            default: // 2-3. 신규, 수정 요청 상태일 시
                throw new IllegalStateException("심사 중일 시 수정이 불가합니다.");
        }
    }
    /* 삭제 */
    // 1. 협력사 사용자 삭제
    @Transactional
    public void deleteVendorUser(
            VendorUserRegisterDto vendorUserRegisterDto,
            SessionUser loginUser){

        String userId = vendorUserRegisterDto.getUserId();
        String loginId = loginUser.getUserId();


        VendorUserListDto vendorUser = vendorUserMapper.selectVendorUserVNCH_USByUserId(userId);
        // 1) 존재 여부 확인
        if(vendorUser == null){
            throw new IllegalStateException("사용자 정보가 없습니다.");
        }
        // 2) 상태 값 확인
        switch(vendorUser.getStatus()){
            case "A": // 2-1. 승인 상태일 시

                // 1) 자신은 삭제 불가
                if(loginId.equals(userId)){
                    throw new IllegalStateException("본인 계정은 삭제할 수 없습니다.");
                }
                
                // 2) 같은 협력체 소속 사용자만 삭제 가능 (프론트 값 신뢰 금지, db에서 조회 후 입력)
                if(!loginUser.getVendorCd().equals(vendorUser.getVendorCode()) ){
                    throw new IllegalStateException("타업체 사용자는 삭제할 수 없습니다.");
                }
        
                // 3) 최소 한명의 관리자 유지 필수 (프론트 값 신뢰 금지, db에서 조회 후 입력)
                if("VENDOR".equals(vendorUser.getRole())){
                    String vendorCode = vendorUser.getVendorCode();
                    int countAdmin = vendorUserMapper.countVendorUsers(vendorCode);
                    if(countAdmin < 2){
                        throw new IllegalStateException("관리자 수는 최소 1명이 필요합니다.");
                    }
                }
        
                // 4) 삭제 승인 중복 시 삭제 불가
                int countWaitRequest = vendorUserMapper.countWaitRequest(userId);
                if (countWaitRequest > 0) {
                    throw new IllegalStateException("이미 심사 중인 삭제 요청이 있어 삭제할 수 없습니다.");
                }
        
                // 5) 진행 중인 승인 건 존재 시 삭제 불가
                int countActiveProcess = vendorUserMapper.countActiveProcess(userId);
                if(countActiveProcess > 0){
                    throw new IllegalStateException("진행 중인 프로세스가 존재하여 삭제할 수 없습니다.");
                }
                
                String askUserNum = docNumService.generateDocNumStr(DocKey.RQ);
                vendorUserRegisterDto.setAskUserNum(askUserNum);
                vendorUserRegisterDto.setCreatedAt(LocalDate.now());
                vendorUserRegisterDto.setCreatedBy(loginId);
                vendorUserRegisterDto.setStatus("C");
                vendorUserRegisterDto.setReqType("D");
                vendorUserRegisterDto.setPassword(vendorUser.getPassword());

                vendorUserMapper.insertUserVNCH_US(vendorUserRegisterDto);
                break;
            case "R": // 2-2. 반려 상태일 시
                
                // 1) 업데이트 dto 생성
                VendorUserUpdateDto updateDto = new VendorUserUpdateDto();
                updateDto.setAskUserNum(vendorUser.getAskUserNum());
                updateDto.setModifiedAt(LocalDate.now());
                updateDto.setModifiedBy(loginId);

                // 2) 마스터 테이블 등록 이력 조회
                // 등록 이력 존재 시 재삭제 요청 / 미등록 시 바로 삭제 처리
                int countMaster = vendorUserMapper.countVendorUsersByUserId(vendorUser.getUserId());

                if(countMaster > 0){
                    updateDto.setStatus("C");
                    updateDto.setReqType("D");
                    updateDto.setRejectRemark("");
                    vendorUserMapper.updateVNCH_USByAskUserNum(updateDto);
                } else{
                    updateDto.setDelFlag("Y");
                    vendorUserMapper.updateVNCH_USByAskUserNum(updateDto);
                }
                break;
            default: // 2-3. 신규, 수정 요청 상태일 시
                throw new IllegalStateException("심사 중인 사용자는 삭제할 수 없습니다.");
        }
    }
}

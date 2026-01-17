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
//    진현님, 이 질문은 ERP 시스템의 데이터 무결성을 결정짓는 아주 중요한 포인트입니다! 결론부터 말씀드리면, 네, 핵심 정보에 대해서는 수정도 불가능하게 막는 것이 실무의 정석입니다.
//
//    하지만 '삭제'와 달리 '수정'은 어떤 항목을 고치느냐에 따라 정책을 조금 유연하게 가져갈 필요가 있습니다.
//
//1. 수정하면 절대 안 되는 항목 (Hard Lock)
//    프로세스가 진행 중일 때(PR, RFQ, PO 등) 아래 항목을 수정하면 시스템 전체 데이터가 꼬여버립니다.
//
//    사용자 ID (USER_ID): 모든 업무 테이블에 외래키(FK)나 담당자 ID로 박혀 있기 때문에, 이걸 바꾸면 과거 이력이 '유령 데이터'가 됩니다.
//
//    소속 업체 코드 (VENDOR_CD): 업체가 바뀌면 견적이나 발주서의 주인이 바뀌는 셈이라 절대 안 됩니다.
//
//    권한 (ROLE): ADMIN에서 USER로 갑자기 권한이 바뀌면, 승인 프로세스 도중에 결재권이 사라져버리는 사고가 발생합니다.
//
//2. 수정해도 괜찮은 항목 (Soft Update)
//    업무 진행과는 상관없는 단순 신상 정보는 굳이 막지 않아도 됩니다.
//
//    사용자 이름: 오타 수정이나 개명 등.
//
//    연락처 / 이메일: 업무 연락을 위해 오히려 최신화되어야 하는 정보입니다.
//
//            비밀번호: 보안상 언제든 바꿀 수 있어야 합니다.

    /* 삭제 */
    // 1. 협력사 사용자 삭제
    @Transactional
    public void deleteVendorUser(
            VendorUserRegisterDto vendorUserRegisterDto,
            SessionUser loginUser){

        String userId = vendorUserRegisterDto.getUserId();
        String loginId = loginUser.getUserId();

        
        VendorUserRegisterDto vendorUser = vendorUserMapper.selectVendorUserByUserId(userId);
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
                
                // 2) 같은 협력체 소속 사용자만 삭제 가능
                if(!loginUser.getVendorCd().equals(vendorUserRegisterDto.getVendorCode()) ){
                    throw new IllegalStateException("타업체 사용자는 삭제할 수 없습니다.");
                }
        
                // 3) 최소 한명의 관리자 유지 필수
                if("VENDOR".equals(vendorUserRegisterDto.getRole())){
                    String vendorCode = vendorUserRegisterDto.getVendorCode();
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

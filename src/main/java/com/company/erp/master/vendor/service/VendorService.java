package com.company.erp.master.vendor.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.file.exception.FileException;
import com.company.erp.common.file.model.AttFileEntity;
import com.company.erp.common.file.service.FileService;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.vendor.dto.*;
import com.company.erp.master.vendor.mapper.VendorMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class VendorService {

    @Autowired
    VendorMapper vendorMapper;

    @Autowired
    DocNumService docNumService;

    @Autowired
    FileService fileService;

    /* 조회 */
    public VendorResponseDto<VendorListDto> getVendorList(VendorSearchDto vendorSearchDto) {
        // 1. 총 협력사 수 계산
        // 2. 총 페이지 계산
        // 3. Dto 반환
        return new VendorResponseDto<VendorListDto>(
                vendorMapper.selectVendorList(vendorSearchDto),
                vendorSearchDto.getPage(),
                vendorSearchDto.getPageSize(),
                1,
                1
        );
    }
    
    // 2. 회사 코드로 파일 번호 조회
    public List<AttFileEntity> getFilesByVendorCode(String vendorCode, SessionUser loginUser) {
        
        // 1. 협력사 직원일 경우 자신의 회사만 조회 가능
        if ("VENDOR".equals(loginUser.getRole())) {
            if (!vendorCode.equals(loginUser.getVendorCd())) {
                throw new IllegalStateException("해당 정보에 접근 권한이 없습니다.");
            }
        }
        
        // 2. 파일 번호 조회
        List<String> fileNumList = vendorMapper.selectFileNumByVendorCode(vendorCode);

        // 3. 조회한 파일 정보 리스트
        List<AttFileEntity> files = new ArrayList<>();

        // 4. 상세 정보 조회 후 저장
        for(String fileNum : fileNumList){
            AttFileEntity file = fileService.getFileInfo(fileNum, loginUser);
            if (file != null) {
                files.add(file);
            }
        }

        return files;
    }
    
    // 3. 대기 테이블에서 최신 수정 요청 데이터 조회
    public VendorRegisterDto getVendorVNCHByVendorCode(String vendorCode) {
        return vendorMapper.selectVendorVNCHByVendorCode(vendorCode);
    }

    // 4. 마스터 테이블에서 이전 데이터 조회
    public VendorRegisterDto getVendorVNGLByVendorCode(String vendorCode) {
        return vendorMapper.selectVendorVNGLByVendorCode(vendorCode);
    }

    /* 수정 */
    @Transactional
    public void updateVendor(VendorUpdateDto vendorUpdateDto, String loginId){

        // 1. 마스터 테이블 업데이트
        vendorUpdateDto.setModifiedBy(loginId);
        vendorUpdateDto.setModifiedAt(LocalDateTime.now());
        vendorUpdateDto.setStatus("A");

        int updatedMaster = vendorMapper.updateVendorVNGL(vendorUpdateDto);
        
        // 2. 정상 업데이트 여부 확인
        if(updatedMaster == 0){
            throw new NoSuchElementException("회사가 존재하지 않습니다");
        }

        // 3. 구매사에서 직접 수정 시에도 대기 테이블 이력 남기기
        VendorRegisterDto master =  vendorMapper.selectVendorVNGLByVendorCode(vendorUpdateDto.getVendorCode());

        String askNum = docNumService.generateDocNumStr(DocKey.MD);
        master.setAskNum(askNum);
        master.setCreatedBy(loginId);
        master.setCreatedAt(LocalDateTime.now());
        master.setStatus("A");

        vendorMapper.insertVendorVNCH(master);
    }

    /* 저장 */
    // 1. 구매사에서 직접 등록 -> 바로 승인 후 마스터 테이블로 이동
    @Transactional
    public String registerVendorInternal(VendorRegisterDto vendorRegisterDto, String sessionId) {

        // 1. 중복 체크
        boolean existsBusinessNo = vendorMapper.existsByBusinessNo(vendorRegisterDto.getBusinessNo());

        if(existsBusinessNo) {
            throw new IllegalStateException("동일한 사업자 번호가 존재합니다.");
        }

        // 2. 체번 및 입력 값 입력
        String vendorCode = docNumService.generateDocNumStr(DocKey.VN);
        vendorRegisterDto.setVendorCode(vendorCode);
        vendorRegisterDto.setCreatedBy(sessionId);
        vendorRegisterDto.setCreatedAt(LocalDateTime.now());
        vendorRegisterDto.setSignDate(LocalDateTime.now());

        // 3. 마스터 테이블에 저장
        vendorMapper.insertVendorVNGL(vendorRegisterDto);

        // 4. 파일 저장 시 사용할 회사 코드 반환
        return vendorCode;
    }

    // 2. 구매사에서 승인
    @Transactional
    public void approveVendor(List<VendorRegisterDto> vendorRegisterDtoList, String loginId) {

        // 1) 단일 dto 반환 (일괄 처리 건수가 많지 않으므로 서비스 레이어에서 for문으로 처리)
        for(VendorRegisterDto dto : vendorRegisterDtoList) {
            String askNum = dto.getAskNum();
            // 2) 선택된 협력사 정보 조회
            VendorRegisterDto vendor = vendorMapper.selectVendorByAskNum(askNum);

            if(vendor == null) {
                throw new IllegalStateException("해당 협력사가 존재하지 않습니다");
            }
            // 3) 공통값 입력
            vendor.setModifiedBy(loginId);
            vendor.setModifiedAt(LocalDateTime.now());
            vendor.setSignDate(LocalDateTime.now());
            
            // 4) 상태값 확인
            String status = vendor.getStatus();
            switch (status) {

                case "N": // 신규 등록 시
                    vendorMapper.insertVendorVNGL(vendor);
                    break;

                case "C": // 변경 요청 시
                    vendorMapper.updateVNGLByVendorCode(vendor);
                    break;

                default:
                    throw new IllegalStateException("승인 가능한 상태가 아닙니다.");
            }

            // 6) 대기 테이블 업데이트 ('A' 상태로 내역 남기기)
            VendorUpdateDto vendorUpdateDto = new VendorUpdateDto(); // 상황에 따라 필요한 값이 다르므로 di 불가
            vendorUpdateDto.setModifiedAt(LocalDateTime.now());
            vendorUpdateDto.setModifiedBy(loginId);
            vendorUpdateDto.setAskNum(askNum); // where 용
            vendorUpdateDto.setDelFlag("N");
            vendorUpdateDto.setStatus("A");
            vendorUpdateDto.setSignUserId(loginId);

            vendorMapper.updateVNCHByAskNum(vendorUpdateDto);
        }
    }
    
    // 3. 구매사에서 반려
    @Transactional
    public void rejectVendor(List<VendorUpdateDto> vendorUpdateDtoList, SessionUser loginUser) {

        // 2) 단일 dto 반환
        for(VendorUpdateDto dto : vendorUpdateDtoList) {

            // 3) 입력값 설정
            dto.setModifiedAt(LocalDateTime.now());
            dto.setModifiedBy(loginUser.getUserId());
            dto.setSignUserId(loginUser.getUserId());
            dto.setStatus("R");

            // 3) 대기 테이블 업데이트
            vendorMapper.updateVNCHByAskNum(dto);

            List<String> fileNums = dto.getFileNums();
            if(fileNums != null && !fileNums.isEmpty()) {
                for(String fileNum : fileNums) {
                    fileService.delete(fileNum, loginUser);
                }
            }
        }

    }
}

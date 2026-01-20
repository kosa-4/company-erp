package com.company.erp.master.vendor.controller;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.file.model.AttFileEntity;
import com.company.erp.common.file.service.FileService;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.vendor.dto.*;
import com.company.erp.master.vendor.mapper.VendorMapper;
import com.company.erp.master.vendor.service.VendorService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@SessionIgnore
@RestController
@RequestMapping("/api/v1/vendors")
public class VendorController {
    @Autowired
    private VendorService vendorService;

    @Autowired
    private FileService fileService;

    @Autowired
    private DocNumService docNumService;

    /* 조회 */
    @GetMapping
    public ResponseEntity<VendorResponseDto<VendorListDto>> getVendorList(VendorSearchDto vendorSearchDto) {
        VendorResponseDto<VendorListDto> vendors = vendorService.getVendorList(vendorSearchDto);
        return ResponseEntity.ok(vendors);
    }

    // 2. 첨부파일 조회
    @GetMapping("{vendorCode}/files")
    public ApiResponse getFileList(
            @PathVariable("vendorCode") String vendorCode,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser) {
        // 1. 회사 코드로 파일 번호 조회
        List<String> fileNumList = vendorService.getFileNumByVendorCode(vendorCode);

        // 2. 조회한 파일 정보 리스트
        List<AttFileEntity> files = new ArrayList<>();
        
        // 3. 상세 정보 조회 후 저장
        for(String fileNum : fileNumList){
            AttFileEntity file = fileService.getFileInfo(fileNum, loginUser);
            files.add(file);
        }

        return ApiResponse.ok(files);
    }

    /* 저장 */
    // 1. 구매사에서 직접 협력업체 저장
    @PostMapping("/new")
    public ApiResponse registerVendorInternal(@Valid @RequestBody VendorRegisterDto vendorRegisterDto, HttpSession currentSession) {
        // 1) 현재 로그인 정보 반환
        Object sessionAttr = currentSession.getAttribute(SessionConst.LOGIN_USER);
        SessionUser loginUser = (sessionAttr instanceof SessionUser) ? (SessionUser) sessionAttr : null;

        // 2) 로그인 정보 확인
        if (loginUser == null) {
            // userObj가 null인 경우 예외를 던지거나 401 에러 반환
            return ApiResponse.fail("로그인 정보가 없습니다.");
        }

        // 3) id 반환
        String loginId = loginUser.getUserId();

        // 5) 저장 함수 실행
        String vendorCode = vendorService.registerVendorInternal(vendorRegisterDto, loginId);
        return ApiResponse.ok("협력업체 등록이 완료되었습니다", vendorCode);
    }
    


    // 2. 협력업체 승인
    @PostMapping("/approve")
    public ApiResponse approveVendor(@RequestBody List<VendorRegisterDto> vendorRegisterDtoList, HttpSession currentSession) {
        // 1) 현재 로그인 정보 반환
        Object sessionAttr = currentSession.getAttribute(SessionConst.LOGIN_USER);
        SessionUser loginUser = (sessionAttr instanceof SessionUser) ? (SessionUser) sessionAttr : null;

        // 2) 로그인 정보 확인
        if (loginUser == null) {
            // userObj가 null인 경우 예외를 던지거나 401 에러 반환
            return ApiResponse.fail("로그인 정보가 없습니다.");
        }

        // 3) id 반환
        String loginId = loginUser.getUserId();
        
        // 5) 승인 함수 실행
        vendorService.approveVendor(vendorRegisterDtoList, loginId);
        return ApiResponse.ok("협력업체 승인이 완료되었습니다");
    }
    
    // 3. 협력업체 반려
    @PostMapping("/reject")
    public ApiResponse rejectVendor(@RequestBody List<VendorUpdateDto> vendorUpdateDtoList, HttpSession currentSession) {
        // 1) 현재 로그인 정보 반환
        Object sessionAttr = currentSession.getAttribute(SessionConst.LOGIN_USER);
        SessionUser loginUser = (sessionAttr instanceof SessionUser) ? (SessionUser) sessionAttr : null;

        // 2) 로그인 정보 확인
        if (loginUser == null) {
            // userObj가 null인 경우 예외를 던지거나 401 에러 반환
            return ApiResponse.fail("로그인 정보가 없습니다.");
        }

        // 3) id 반환
        String loginId = loginUser.getUserId();

        // 5) 반려 함수 실행
        vendorService.rejectVendor(vendorUpdateDtoList, loginId);
        return ApiResponse.ok("반려 처리 되었습니다.");
    }

    // 3. 첨부 파일 저장
    @PostMapping("/files/{vendorCode}")
    public ApiResponse registerFile(
            @PathVariable("vendorCode") String vendorCode,
            @RequestParam("file") List<MultipartFile> files,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser) {

        for (MultipartFile file : files) {
            String file_num = docNumService.generateDocNumStr(DocKey.FL);
            fileService.upload(file, "VN", file_num, vendorCode, loginUser);
        }
        return ApiResponse.ok(null);
    }
    
}

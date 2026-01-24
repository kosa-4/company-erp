package com.company.erp.master.vendor.controller;

import com.company.erp.common.auth.RequireRole;
import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.file.model.AttFileEntity;
import com.company.erp.common.file.service.FileService;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.vendor.dto.VendorListDto;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.service.VendorPortalService;
import com.company.erp.master.vendor.service.VendorService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/vendor-portal/info")
@RequireRole({ "BUYER", "ADMIN", "VENDOR" })
public class VendorPortalController {
    @Autowired
    VendorPortalService vendorPortalService;

    @Autowired
    FileService fileService;

    @Autowired
    VendorService vendorService;

    @Autowired
    DocNumService  docNumService;

    /* 조회 */
    @GetMapping
    public ResponseEntity<?> getVendorInfo(
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser){

        // 3) id 반환
        String loginId = loginUser.getUserId();
        VendorListDto vendor =  vendorPortalService.getVendorInfo(loginId);
        return ResponseEntity.ok().body(vendor);
    }

    /* 변경 요청 */
    @PostMapping("/change")
    public ApiResponse requestVendorChange(@RequestBody VendorRegisterDto vendorRegisterDto, HttpSession currentSession){
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

        String askNum = vendorPortalService.requestVendorChange(vendorRegisterDto, loginId);
        return ApiResponse.ok("수정 요청이 완료되었습니다", askNum);
    }
    
    // 3. 첨부 파일 조회
    @GetMapping("{vendorCode}/files")
    public ApiResponse getFileList(
            @PathVariable("vendorCode") String vendorCode,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser) {
        // 1. 회사 코드로 파일 번호 조회
        List<AttFileEntity> files = vendorService.getFilesByVendorCode(vendorCode, loginUser);

        return ApiResponse.ok(files);
    }

    // 4. 첨부 파일 저장
    @PostMapping("/files/{askNum}")
    public ApiResponse registerFile(
            @PathVariable("askNum") String askNum,
            @RequestParam("file") List<MultipartFile> files,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser) {
        
        // 1. 회사 코드 조회
        String vendorCode = vendorPortalService.getVendorCodeByAskNum(askNum);

        // 2. 회사 코드 검증
        if(vendorCode == null){
            throw new NoSuchElementException("유효하지 않은 요청 번호입니다.");
        }
        
        // 3. 동일 소속 검증
        if(!loginUser.getVendorCd().equals(vendorCode)){
            throw new IllegalStateException("본인 소속 업체의 파일만 업로드 가능합니다.");
        }

        for (MultipartFile file : files) {
            fileService.upload(file, "VN", askNum, vendorCode, loginUser);
        }
        return ApiResponse.ok(null);
    }
}

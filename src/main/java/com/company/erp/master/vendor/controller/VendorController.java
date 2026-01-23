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
import com.company.erp.master.vendor.dto.*;
import com.company.erp.master.vendor.mapper.VendorMapper;
import com.company.erp.master.vendor.service.VendorService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.apache.tomcat.util.buf.UriUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/vendors")
@RequireRole({ "BUYER", "ADMIN" })
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
        List<AttFileEntity> files = vendorService.getFilesByVendorCode(vendorCode, loginUser);

        return ApiResponse.ok(files);
    }

    // 3. 대기 테이블에서 수정 후 데이터 조회
    @GetMapping("{vendorCode}")
    public ApiResponse getChangedVendor(
            @PathVariable("vendorCode") String vendorCode,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser){
        VendorRegisterDto vendorChanged =  vendorService.getVendorVNCHByVendorCode(vendorCode);
        if(vendorChanged == null){
            return ApiResponse.ok("기존 승인 정보가 없는 신규 업체입니다.", null);
        }
        return ApiResponse.ok(vendorChanged);
    }

    // 4. 마스터 테이블에서 수정 전 데이터 조회
    @GetMapping("/master/{vendorCode}")
    public ApiResponse getPreviousVendor(
            @PathVariable("vendorCode") String vendorCode,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser){
        VendorRegisterDto vendorPrev = vendorService.getVendorVNGLByVendorCode(vendorCode);
        if(vendorPrev == null){
            return ApiResponse.ok("기존 정보가 없습니다.");
        }
        return ApiResponse.ok(vendorPrev);
    }

    /* 수정 */
    // 1. 수정
    @PutMapping("/update")
    public ApiResponse updateVendor(
            @RequestBody VendorUpdateDto vendorUpdateDto,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser){
        vendorService.updateVendor(vendorUpdateDto, loginUser.getUserId());
        return ApiResponse.ok("업데이트 완료");
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
    public ApiResponse rejectVendor(
            @RequestBody List<VendorUpdateDto> vendorUpdateDtoList,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser) {

        // 5) 반려 함수 실행
        vendorService.rejectVendor(vendorUpdateDtoList, loginUser);
        return ApiResponse.ok("반려 처리 되었습니다.");
    }

    // 4. 첨부 파일 저장
    @PostMapping("/files/{vendorCode}")
    public ApiResponse registerFile(
            @PathVariable("vendorCode") String vendorCode,
            @RequestParam("file") List<MultipartFile> files,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser) {
        // 1. 공통 번호 체번
        String file_num = docNumService.generateDocNumStr(DocKey.FL);
        for (MultipartFile file : files) {
            fileService.upload(file, "VN", file_num, vendorCode, loginUser);
        }
        return ApiResponse.ok(null);
    }
    // 5. 첨부 파일 다운로드
    @GetMapping("/files/download/{fileNum}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable("fileNum") String fileNum,
            @SessionAttribute(name = SessionConst.LOGIN_USER) SessionUser loginUser
    ){  
        // 1. 파일 다운로드 준비 (경로 지정)
        Resource resource = fileService.download(fileNum, loginUser);

        // 2. 메타 데이터 준비 (파일명)
        AttFileEntity file = fileService.getFileInfo(fileNum, loginUser);
        String encordedFileName = UriUtils.encode(file.getOriginName(),  StandardCharsets.UTF_8);
        
        // 3. 클라이언트 컴퓨터로 전송
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                // 이진 데이터임을 전달
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition
                                .attachment() // 다운로드 팝업으로 실행 명령
                                .filename(file.getOriginName(), StandardCharsets.UTF_8) // 파일명 전달
                                .build()
                                .toString())
                .body(resource); // 다운로드할 파일과 경로 전달
    }
}

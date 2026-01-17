package com.company.erp.master.vendor.controller;

import com.company.erp.common.exception.ApiResponse;
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

import java.util.List;

@SessionIgnore
@RestController
@RequestMapping("/api/v1/vendors")
public class VendorController {
    @Autowired
    private VendorService vendorService;

    /* 조회 */
    @GetMapping
    public ResponseEntity<VendorResponseDto<VendorListDto>> getVendorList(VendorSearchDto vendorSearchDto) {
        VendorResponseDto<VendorListDto> vendors = vendorService.getVendorList(vendorSearchDto);
        return ResponseEntity.ok(vendors);
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
        vendorService.registerVendorInternal(vendorRegisterDto, loginId);
        return ApiResponse.ok("협력업체 등록이 완료되었습니다");
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
    
}

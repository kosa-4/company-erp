package com.company.erp.master.vendor.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.master.vendor.dto.*;
import com.company.erp.master.vendor.mapper.VendorMapper;
import com.company.erp.master.vendor.service.VendorService;
import jakarta.servlet.http.HttpSession;
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
    public ApiResponse registerVendorInternal(@RequestBody VendorRegisterDto vendorRegisterDto, HttpSession currentSession) {
        // 1) 세션 정보 조회
        String sessionId = (String) currentSession.getAttribute("sessionId");

        // 2) 세션이 존재하지 않을 시
        if(sessionId == null) {
            return ApiResponse.fail("세션이 만료되었습니다.");
        }
        // 3) 저장 함수 실행
        vendorService.registerVendorInternal(vendorRegisterDto, sessionId);
        return ApiResponse.ok("협력업체 등록이 완료되었습니다");
    }

    // 2. 협력업체 승인
    @PostMapping("/approve")
    public ApiResponse approveVendor(@RequestBody List<VendorRegisterDto> vendorRegisterDtoList) {
        // 1) 세션 정보 조회
//        String sessionId = (String) currentSession.getAttribute("sessionId");
        String sessionId = "Admin";
        // 2) 세션이 존재하지 않을 시
        if(sessionId == null) {
            return ApiResponse.fail("세션이 만료되었습니다.");
        }
        
        // 3) 승인 함수 실행
        vendorService.approveVendor(vendorRegisterDtoList, sessionId);
        return ApiResponse.ok("협력업체 승인이 완료되었습니다");
    }
    
    // 3. 협력업체 반려
    @PostMapping("/reject")
    public ApiResponse rejectVendor(@RequestBody VendorUpdateDto vendorUpdateDto) { //HttpSession currentSession
        // 1) 세션 정보 조회
        //String sessionId = (String) currentSession.getAttribute("sessionId");
        String sessionId = "Admin";

        // 2) 세션이 존재하지 않을 시
        if(sessionId == null) {
            return ApiResponse.fail("세션이 만료되었습니다.");
        }

        // 3) 반려 함수 실행
        vendorService.rejectVendor(vendorUpdateDto, sessionId);
        return ApiResponse.ok("반려 처리 되었습니다.");
    }
    
}

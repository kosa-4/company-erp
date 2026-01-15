package com.company.erp.master.vendoruser.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;
import com.company.erp.master.vendoruser.service.VendorUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@SessionIgnore
@RestController
@RequestMapping("api/v1/vendor-user")
public class VendorUserController {
    @Autowired
    VendorUserService vendorUserService;

    /* 조회 */
    @GetMapping
    public ResponseEntity<?> getVendorUserList(@ModelAttribute VendorUserSearchDto vendorUserSearchDto) {
        List<VendorUserListDto> vendorUsers = vendorUserService.getVendorUserList(vendorUserSearchDto);

        if(vendorUsers == null || vendorUsers.isEmpty()) {
            return ResponseEntity.ok("검색 결과가 없습니다");
        }
        return ResponseEntity.ok(vendorUsers);
    }

    /* 저장 */
    // 1. 협력 업체 사용자 승인
    @PostMapping("/approve")
    public ApiResponse approveVendorUser(@RequestBody List<VendorUserRegisterDto> vendorUserRegisterDtoList) {
        // 1) 세션 정보 조회
        //String sessionId = (String) currentSession.getAttribute("sessionId");
        String sessionId = "User";

        // 2) 세션 존재하지 않을 시
        if(sessionId == null) {
            return ApiResponse.fail("세션이 만료되었습니다.");
        }

        // 3) 승인 함수 실행
        vendorUserService.approveVendorUser(vendorUserRegisterDtoList, sessionId);
        return ApiResponse.ok("사용자 승인이 완료되었습니다.");
    }
}

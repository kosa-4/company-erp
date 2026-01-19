package com.company.erp.master.vendoruser.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;
import com.company.erp.master.vendoruser.dto.VendorUserUpdateDto;
import com.company.erp.master.vendoruser.service.VendorUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@SessionIgnore
@RestController
@RequestMapping("api/v1/vendor-users")
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
    // 1. 구매사에서 승인
    @PostMapping("/approve")
    public ApiResponse approveVendorUser(@RequestBody List<VendorUserRegisterDto> vendorUserRegisterDtoList, HttpSession currentSession) {

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
        vendorUserService.approveVendorUser(vendorUserRegisterDtoList, loginId);
        return ApiResponse.ok("사용자 승인이 완료되었습니다.");
    }

    // 2. 구매사에서 반려
    @PostMapping("/reject")
    public ApiResponse rejectVendorUser(@RequestBody List<VendorUserUpdateDto> vendorUserUpdateDtoList, HttpSession currentSession ) {
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

        vendorUserService.rejectVendorUser(vendorUserUpdateDtoList, loginId);

        return ApiResponse.ok("반려 처리 되었습니다.");
        
    }
}

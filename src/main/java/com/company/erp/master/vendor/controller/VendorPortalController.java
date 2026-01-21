package com.company.erp.master.vendor.controller;

import com.company.erp.common.exception.ApiResponse;
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

@SessionIgnore
@RestController
@RequestMapping("/api/v1/vendor-portal/info")
public class VendorPortalController {
    @Autowired
    VendorPortalService vendorPortalService;

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

        vendorPortalService.requestVendorChange(vendorRegisterDto, loginId);
        return ApiResponse.ok("수정 요청이 완료되었습니다");
    }
}

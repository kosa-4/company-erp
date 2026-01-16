package com.company.erp.master.vendor.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.vendor.dto.VendorListDto;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.service.VendorPortalService;
import com.company.erp.master.vendor.service.VendorService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
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
    public ResponseEntity<?> getVendorInfo(HttpSession currentSession){
        // 1) 객체 통째로 반환
        Object sessionAttr = currentSession.getAttribute(SessionUser.class.getName());

        // 2) 객체의 타입이 SessionUser인지 확인 (안정성을 위한 세션 만료 여부 체크)
        if(!(sessionAttr instanceof SessionUser)){
            return ResponseEntity.badRequest().body("세션이 만료되었습니다.");
        }

        // 3) 타입 전환
        SessionUser userObj = (SessionUser) sessionAttr;

        // 4) id 반환
        String loginId = userObj.getUserId();

        VendorListDto vendor =  vendorPortalService.getVendorInfo(loginId);
        return ResponseEntity.ok().body(vendor);
    }

    /* 변경 요청 */
    @PostMapping("/change")
    public ApiResponse requestVendorChange(@RequestBody VendorRegisterDto vendorRegisterDto, HttpSession currentSession){
        // 1) 객체 통째로 반환
        Object sessionAttr = currentSession.getAttribute(SessionUser.class.getName());

        // 2) 객체의 타입이 SessionUser인지 확인 (안정성을 위한 세션 만료 여부 체크)
        if(!(sessionAttr instanceof SessionUser)){
            return ApiResponse.fail("세션이 만료되었습니다.");
        }

        // 3) 타입 전환
        SessionUser userObj = (SessionUser) sessionAttr;

        // 4) id 반환
        String loginId = userObj.getUserId();

        vendorPortalService.requestVendorChange(vendorRegisterDto, loginId);
        return ApiResponse.ok("수정 요청이 완료되었습니다");
    }
}

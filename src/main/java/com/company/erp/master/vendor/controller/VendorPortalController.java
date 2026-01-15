package com.company.erp.master.vendor.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.service.VendorPortalService;
import com.company.erp.master.vendor.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SessionIgnore
@RestController
@RequestMapping("/api/v1/vendors/users")
public class VendorPortalController {
    @Autowired
    VendorPortalService vendorPortalService;

    /* 변경 요청 */
    @PostMapping("/change")
    public ApiResponse requestVendorChange(@RequestBody VendorRegisterDto vendorRegisterDto){
        String sessionId = "vendor"; // 임시
        if(sessionId == null){
            return ApiResponse.fail("세션이 만료되었습니다.");
        }

        vendorPortalService.requestVendorChange(vendorRegisterDto, sessionId);
        return ApiResponse.ok("수정 요청이 완료되었습니다");
    }
}

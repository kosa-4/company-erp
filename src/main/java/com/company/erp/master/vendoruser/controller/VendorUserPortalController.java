package com.company.erp.master.vendoruser.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.service.VendorUserPortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SessionIgnore
@RestController
@RequestMapping("/api/v1/vendor-portal/users")
public class VendorUserPortalController {
    @Autowired
    VendorUserPortalService vendorUserPortalService;

    @PostMapping("/add")
    public ApiResponse addVendorUser(@RequestBody VendorUserRegisterDto vendorUserRegisterDto){
        vendorUserPortalService.addVendorUser(vendorUserRegisterDto);
        return ApiResponse.ok("승인 요청이 완료 되었습니다.");
    }

}

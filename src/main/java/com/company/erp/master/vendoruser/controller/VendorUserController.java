package com.company.erp.master.vendoruser.controller;

import com.company.erp.common.session.SessionIgnore;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;
import com.company.erp.master.vendoruser.service.VendorUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@SessionIgnore
@RestController
@RequestMapping("api/v1/vendor-user")
public class VendorUserController {
    @Autowired
    VendorUserService vendorUserService;

    @GetMapping
    public ResponseEntity<?> getVendorUserList(@ModelAttribute VendorUserSearchDto vendorUserSearchDto) {
        List<VendorUserListDto> vendorUsers = vendorUserService.getVendorUserList(vendorUserSearchDto);

        if(vendorUsers == null || vendorUsers.isEmpty()) {
            return ResponseEntity.ok("검색 결과가 없습니다");
        }
        return ResponseEntity.ok(vendorUsers);
    }
}

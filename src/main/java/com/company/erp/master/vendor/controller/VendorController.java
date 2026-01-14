package com.company.erp.master.vendor.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.session.SessionIgnore;
import com.company.erp.master.vendor.dto.VendorListDto;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.dto.VendorResponseDto;
import com.company.erp.master.vendor.dto.VendorSearchDto;
import com.company.erp.master.vendor.mapper.VendorMapper;
import com.company.erp.master.vendor.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @PostMapping("/new")
    public ApiResponse registerVendorInternal(@RequestBody VendorRegisterDto vendorRegisterDto) {
        vendorService.registerVendorInternal(vendorRegisterDto);
        return ApiResponse.ok("상품 등록이 완료되었습니다");
    }
}

package com.company.erp.rfq.buyer.vendor.controller;

import com.company.erp.rfq.buyer.vendor.dto.RfqVendorSearchRequest;
import com.company.erp.rfq.buyer.vendor.dto.RfqVendorListResponse;
import com.company.erp.rfq.buyer.vendor.service.RfqBuyerVendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/buyer/rfqs/vendors")
@RequiredArgsConstructor
public class RfqBuyerVendorController {

    private final RfqBuyerVendorService service;

    @GetMapping
    public ResponseEntity<RfqVendorListResponse> getApprovedVendors(RfqVendorSearchRequest request) {
        return ResponseEntity.ok(service.getApprovedVendors(request));
    }
}

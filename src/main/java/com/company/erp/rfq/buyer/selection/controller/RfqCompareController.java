package com.company.erp.rfq.buyer.selection.controller;

import com.company.erp.rfq.buyer.selection.dto.response.RfqCompareResponse;
import com.company.erp.rfq.buyer.selection.service.RfqCompareService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/buyer/rfq-compare")
public class RfqCompareController {

    private final RfqCompareService rfqCompareService;
    @GetMapping("/compare/{rfqNo}")
    public RfqCompareResponse getCompareDetail(@PathVariable String rfqNo) {
        return rfqCompareService.getCompareDetail(rfqNo);
    }
}

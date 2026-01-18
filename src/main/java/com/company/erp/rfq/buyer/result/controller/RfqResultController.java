package com.company.erp.rfq.buyer.result.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.rfq.buyer.result.dto.response.RfqSelectionResultDetailResponse;
import com.company.erp.rfq.buyer.result.dto.response.RfqSelectionResultResponse;
import com.company.erp.rfq.buyer.result.service.RfqResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 협력업체 선정 결과(구매사) 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/buyer/rfq-selection-results")
@RequiredArgsConstructor
public class RfqResultController {

    private final RfqResultService service;

    /**
     * 선정 결과 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RfqSelectionResultResponse>>> getRfqResultList(
            @RequestParam Map<String, Object> params) {
        return ResponseEntity.ok(ApiResponse.ok(service.getRfqResultList(params)));
    }

    /**
     * 선정 결과 상세 조회
     */
    @GetMapping("/{rfqNum}")
    public ResponseEntity<ApiResponse<RfqSelectionResultDetailResponse>> getRfqResultDetail(
            @PathVariable String rfqNum) {
        return ResponseEntity.ok(ApiResponse.ok(service.getRfqResultDetail(rfqNum)));
    }
}

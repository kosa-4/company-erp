package com.company.erp.rfq.buyer.request.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.rfq.buyer.request.dto.request.RfqSaveRequest;
import com.company.erp.rfq.buyer.request.dto.request.RfqSelectRequest;
import com.company.erp.rfq.buyer.request.dto.request.RfqSendRequest;
import com.company.erp.rfq.buyer.request.dto.response.RfqDetailResponse;
import com.company.erp.rfq.buyer.request.service.RfqBuyerRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * RFQ 관리(구매사) 컨트롤러
 */
@RestController
@RequestMapping("/api/buyer/rfqs")
@RequiredArgsConstructor
public class RfqBuyerRequestController {

    private final RfqBuyerRequestService service;

    /**
     * RFQ 상세 조회
     */
    @GetMapping("/{rfqNum}")
    public ResponseEntity<ApiResponse<RfqDetailResponse>> getRfqDetail(@PathVariable String rfqNum) {
        return ResponseEntity.ok(ApiResponse.ok(service.getRfqDetail(rfqNum)));
    }

    /**
     * RFQ 저장 (임시저장 상태에서 HD/DT 수정)
     */
    @PutMapping("/{rfqNum}")
    public ResponseEntity<ApiResponse<Void>> saveRfq(
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSaveRequest request) {

        // TODO: 실제 운영 환경에서는 SecurityContextHolder 또는 Authentication을 통해 loginUserId 추출
        // 필요
        String loginUserId = "master";

        request.setRfqNum(rfqNum);
        service.saveRfq(request, loginUserId);

        // 프로젝트의 ApiResponse.ok(String)은 ApiResponse<Void>를 반환하여 message 필드에 값을 세팅함
        return ResponseEntity.ok(ApiResponse.ok("저장되었습니다."));
    }

    /**
     * 협력업체 전송
     */
    @PostMapping("/{rfqNum}/send")
    public ResponseEntity<ApiResponse<Void>> sendRfq(
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSendRequest request) {

        // TODO: 실제 운영 환경에서는 SecurityContextHolder 또는 Authentication을 통해 loginUserId 추출
        // 필요
        String loginUserId = "master";
        service.sendRfq(rfqNum, request.getVendorCodes(), loginUserId);

        return ResponseEntity.ok(ApiResponse.ok("협력업체 전송이 완료되었습니다."));
    }

    /**
     * 업체 선정
     */
    @PostMapping("/{rfqNum}/select")
    public ResponseEntity<ApiResponse<Void>> selectVendor(
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSelectRequest request) {

        // TODO: 실제 운영 환경에서는 SecurityContextHolder 또는 Authentication을 통해 loginUserId 추출
        // 필요
        String loginUserId = "master";
        request.setRfqNum(rfqNum);

        service.selectVendor(request, loginUserId);

        return ResponseEntity.ok(ApiResponse.ok("업체 선정이 완료되었습니다."));
    }
}

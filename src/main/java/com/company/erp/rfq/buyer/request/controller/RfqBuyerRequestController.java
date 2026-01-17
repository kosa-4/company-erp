package com.company.erp.rfq.buyer.request.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.exception.UnauthorizedException;
import com.company.erp.rfq.buyer.request.dto.request.RfqSaveRequest;
import com.company.erp.rfq.buyer.request.dto.request.RfqSelectRequest;
import com.company.erp.rfq.buyer.request.dto.request.RfqSendRequest;
import com.company.erp.rfq.buyer.request.dto.response.RfqDetailResponse;
import com.company.erp.rfq.buyer.request.service.RfqBuyerRequestService;
import com.company.erp.common.session.SessionUser;
import com.company.erp.common.session.SessionConst;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/buyer/rfqs")
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
     * PR 기반 견적 초안 데이터 조회
     */
    @GetMapping("/init/{prNum}")
    public ResponseEntity<ApiResponse<RfqDetailResponse>> getRfqInit(@PathVariable String prNum) {
        return ResponseEntity.ok(ApiResponse.ok(service.getRfqInitFromPr(prNum)));
    }

    /**
     * 신규 작성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<String>> createRfq(
            HttpSession httpSession,
            @Valid @RequestBody RfqSaveRequest request) {

        SessionUser user = (SessionUser) httpSession.getAttribute(SessionConst.LOGIN_USER);
        if (user == null || user.getUserId() == null || user.getUserId().isBlank()) {
            throw new UnauthorizedException("인증 세션이 유효하지 않습니다.");
        }
        String loginUserId = user.getUserId();

        String rfqNum = service.createRfq(request, loginUserId);
        return ResponseEntity.ok(ApiResponse.ok(rfqNum, "견적이 생성되었습니다."));
    }

    /**
     * RFQ 저장
     */
    @PutMapping("/{rfqNum}")
    public ResponseEntity<ApiResponse<Void>> saveRfq(
            HttpSession httpSession,
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSaveRequest request) {

        SessionUser user = (SessionUser) httpSession.getAttribute(SessionConst.LOGIN_USER);
        if (user == null || user.getUserId() == null || user.getUserId().isBlank()) {
            throw new UnauthorizedException("인증 세션이 유효하지 않습니다.");
        }
        String loginUserId = user.getUserId();

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
            HttpSession httpSession,
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSendRequest request) {

        SessionUser user = (SessionUser) httpSession.getAttribute(SessionConst.LOGIN_USER);
        if (user == null || user.getUserId() == null || user.getUserId().isBlank()) {
            throw new UnauthorizedException("인증 세션이 유효하지 않습니다.");
        }
        String loginUserId = user.getUserId();
        service.sendRfq(rfqNum, request.getVendorCodes(), loginUserId);

        return ResponseEntity.ok(ApiResponse.ok("협력업체 전송이 완료되었습니다."));
    }

    /**
     * 업체 선정
     */
    @PostMapping("/{rfqNum}/select")
    public ResponseEntity<ApiResponse<Void>> selectVendor(
            HttpSession httpSession,
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSelectRequest request) {

        SessionUser user = (SessionUser) httpSession.getAttribute(SessionConst.LOGIN_USER);
        if (user == null || user.getUserId() == null || user.getUserId().isBlank()) {
            throw new UnauthorizedException("인증 세션이 유효하지 않습니다.");
        }
        String loginUserId = user.getUserId();
        request.setRfqNum(rfqNum);

        service.selectVendor(request, loginUserId);

        return ResponseEntity.ok(ApiResponse.ok("업체 선정이 완료되었습니다."));
    }
}

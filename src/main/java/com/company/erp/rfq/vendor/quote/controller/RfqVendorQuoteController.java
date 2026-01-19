package com.company.erp.rfq.vendor.quote.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.exception.UnauthorizedException;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import com.company.erp.rfq.vendor.quote.dto.request.VendorQuoteRequest;
import com.company.erp.rfq.vendor.quote.dto.response.VendorQuoteResponse;
import com.company.erp.rfq.vendor.quote.service.RfqVendorQuoteService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 협력사 견적서 작성 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/vendor/rfqs/{rfqNum}/quote")
@RequiredArgsConstructor
public class RfqVendorQuoteController {

    private final RfqVendorQuoteService service;

    /**
     * 세션에서 협력사 정보 추출
     */
    private SessionUser getSessionUser(HttpSession session) {
        SessionUser user = (SessionUser) session.getAttribute(SessionConst.LOGIN_USER);

        if (!"V".equals(user.getComType())) {
            throw new UnauthorizedException("협력사 사용자만 접근 가능합니다.");
        }
        if (user.getVendorCd() == null || user.getVendorCd().isBlank()) {
            throw new UnauthorizedException("협력사 코드가 없습니다.");
        }
        return user;
    }

    /**
     * 견적 데이터 조회 (편집용)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<VendorQuoteResponse>> getQuoteForEdit(
            HttpSession session,
            @PathVariable String rfqNum) {
        SessionUser user = getSessionUser(session);
        VendorQuoteResponse response = service.getQuoteForEdit(rfqNum, user.getVendorCd());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * 견적 임시저장
     */
    @PostMapping("/save")
    public ResponseEntity<ApiResponse<Void>> saveQuoteDraft(
            HttpSession session,
            @PathVariable String rfqNum,
            @Valid @RequestBody VendorQuoteRequest request) {
        SessionUser user = getSessionUser(session);
        service.saveQuoteDraft(rfqNum, user.getVendorCd(), request, user.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("견적이 임시저장되었습니다."));
    }

    /**
     * 견적 제출
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Void>> submitQuote(
            HttpSession session,
            @PathVariable String rfqNum,
            @Valid @RequestBody VendorQuoteRequest request) {
        SessionUser user = getSessionUser(session);
        service.submitQuote(rfqNum, user.getVendorCd(), request, user.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("견적이 제출되었습니다."));
    }
}

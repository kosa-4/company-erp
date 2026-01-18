package com.company.erp.rfq.vendor.management.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.exception.UnauthorizedException;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import com.company.erp.rfq.vendor.management.dto.request.VendorRfqSearchRequest;
import com.company.erp.rfq.vendor.management.dto.response.VendorRfqDetailResponse;
import com.company.erp.rfq.vendor.management.dto.response.VendorRfqListResponse;
import com.company.erp.rfq.vendor.management.service.RfqVendorManagementService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 협력사 견적관리 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/vendor/rfqs")
@RequiredArgsConstructor
public class RfqVendorManagementController {

    private final RfqVendorManagementService service;

    /**
     * 세션에서 협력사 코드 및 사용자 ID 추출
     */
    private SessionUser getSessionUser(HttpSession session) {
        SessionUser user = (SessionUser) session.getAttribute(SessionConst.LOGIN_USER);
        if (user == null || user.getUserId() == null || user.getUserId().isBlank()) {
            throw new UnauthorizedException("인증 세션이 유효하지 않습니다.");
        }
        // 협력사 사용자인지 확인
        if (!"V".equals(user.getComType())) {
            throw new UnauthorizedException("협력사 사용자만 접근 가능합니다.");
        }
        if (user.getVendorCd() == null || user.getVendorCd().isBlank()) {
            throw new UnauthorizedException("협력사 코드가 없습니다.");
        }
        return user;
    }

    /**
     * 협력사별 RFQ 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<VendorRfqListResponse>>> getVendorRfqList(
            HttpSession session,
            VendorRfqSearchRequest search) {
        SessionUser user = getSessionUser(session);
        List<VendorRfqListResponse> list = service.getVendorRfqList(user.getVendorCd(), search);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * 협력사별 RFQ 상세 조회
     */
    @GetMapping("/{rfqNum}")
    public ResponseEntity<ApiResponse<VendorRfqDetailResponse>> getVendorRfqDetail(
            HttpSession session,
            @PathVariable String rfqNum) {
        SessionUser user = getSessionUser(session);
        VendorRfqDetailResponse detail = service.getVendorRfqDetail(rfqNum, user.getVendorCd());
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    /**
     * RFQ 접수
     */
    @PostMapping("/{rfqNum}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptRfq(
            HttpSession session,
            @PathVariable String rfqNum) {
        SessionUser user = getSessionUser(session);
        service.acceptRfq(rfqNum, user.getVendorCd(), user.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("견적 요청을 접수했습니다."));
    }

    /**
     * RFQ 포기
     */
    @PostMapping("/{rfqNum}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectRfq(
            HttpSession session,
            @PathVariable String rfqNum) {
        SessionUser user = getSessionUser(session);
        service.rejectRfq(rfqNum, user.getVendorCd(), user.getUserId());
        return ResponseEntity.ok(ApiResponse.ok("견적을 포기했습니다."));
    }
}

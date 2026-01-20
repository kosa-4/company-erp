package com.company.erp.rfq.buyer.selection.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.exception.UnauthorizedException;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import com.company.erp.rfq.buyer.selection.dto.request.RfqSelectionRequest;
import com.company.erp.rfq.buyer.selection.dto.response.RfqSelectionResponse;
import com.company.erp.rfq.buyer.selection.service.RfqSelectionService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 협력업체 선정(구매사) 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/buyer/rfq-selections")
@RequiredArgsConstructor
public class RfqSelectionController {

    private final RfqSelectionService service;

    private String loginUserId(HttpSession session) {
        SessionUser user = (SessionUser) session.getAttribute(SessionConst.LOGIN_USER);
        if (user == null || user.getUserId() == null || user.getUserId().isBlank()) {
            throw new UnauthorizedException("인증 세션이 유효하지 않습니다.");
        }
        return user.getUserId();
    }

    /**
     * 선정 대상 견적 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RfqSelectionResponse>>> getSelectionList(
            HttpSession session,
            @RequestParam Map<String, Object> params) {
        // 구매 담당자 여부 등 추가 검증 가능
        return ResponseEntity.ok(ApiResponse.ok(service.getSelectionList(params)));
    }

    /**
     * 견적 개찰 (M -> G)
     */
    @PostMapping("/{rfqNum}/open")
    public ResponseEntity<ApiResponse<Void>> openRfq(
            HttpSession session,
            @PathVariable String rfqNum) {
        String userId = loginUserId(session);
        service.openRfq(rfqNum, userId);
        return ResponseEntity.ok(ApiResponse.ok("개찰 처리되었습니다."));
    }

    /**
     * 업체 선정
     */
    @PostMapping("/{rfqNum}/select")
    public ResponseEntity<ApiResponse<Void>> selectVendor(
            HttpSession session,
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSelectionRequest request) {
        String userId = loginUserId(session);
        request.setRfqNum(rfqNum);
        service.selectVendor(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("업체 선정이 완료되었습니다."));
    }
}

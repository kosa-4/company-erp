package com.company.erp.rfq.buyer.progress.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.exception.UnauthorizedException;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import com.company.erp.rfq.buyer.progress.dto.request.RfqProgressSearchRequest;
import com.company.erp.rfq.buyer.progress.dto.request.RfqSendRequest;
import com.company.erp.rfq.buyer.progress.dto.response.RfqProgressGroupResponse;
import com.company.erp.rfq.buyer.progress.service.RfqProgressService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/buyer/rfqs/progress")
@RequiredArgsConstructor
public class RfqProgressController {

    private final RfqProgressService service;

    private String getLoginUserId(HttpSession session) {
        SessionUser user = (SessionUser) session.getAttribute(SessionConst.LOGIN_USER);
        if (user == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return user.getUserId();
    }

    /**
     * 견적 진행 현황 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RfqProgressGroupResponse>>> getProgressList(
            @ModelAttribute RfqProgressSearchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.getProgressList(request)));
    }

    /**
     * 협력사 전송
     */
    @PostMapping("/{rfqNum}/send")
    public ResponseEntity<ApiResponse<Void>> sendRfq(
            HttpSession session,
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSendRequest request) {
        String userId = getLoginUserId(session);
        service.sendRfq(rfqNum, request.getVendorCodes(), userId);
        return ResponseEntity.ok(ApiResponse.ok("전송이 완료되었습니다."));
    }

    /**
     * 견적 마감
     */
    @PostMapping("/{rfqNum}/close")
    public ResponseEntity<ApiResponse<Void>> closeRfq(
            HttpSession session,
            @PathVariable String rfqNum) {
        String userId = getLoginUserId(session);
        service.closeRfq(rfqNum, userId);
        return ResponseEntity.ok(ApiResponse.ok("마감 처리되었습니다."));
    }

}

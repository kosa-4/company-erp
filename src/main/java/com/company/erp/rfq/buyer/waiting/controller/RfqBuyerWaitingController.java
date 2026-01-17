package com.company.erp.rfq.buyer.waiting.controller;

import com.company.erp.common.exception.UnauthorizedException;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import com.company.erp.rfq.buyer.waiting.dto.request.RfqWaitingSearchRequest;
import com.company.erp.rfq.buyer.waiting.dto.response.PrGroup;
import com.company.erp.rfq.buyer.waiting.service.RfqBuyerWaitingService;
import com.company.erp.rfq.buyer.waiting.service.RfqBuyerWaitingService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 견적대기목록 Controller
 */
@RestController
@RequestMapping("/api/v1/rfq/buyer/waiting")
@RequiredArgsConstructor
public class RfqBuyerWaitingController {

    private final RfqBuyerWaitingService service;

    /**
     * 견적대기목록 조회
     * GET /api/v1/rfq/buyer/waiting/list
     */
    @GetMapping("/list")
    public ResponseEntity<List<PrGroup>> getWaitingList(RfqWaitingSearchRequest request) {
        List<PrGroup> list = service.getWaitingList(request);
        return ResponseEntity.ok(list);
    }

}

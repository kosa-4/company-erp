package com.company.erp.rfq.buyer.request.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.exception.UnauthorizedException;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import com.company.erp.rfq.buyer.request.dto.request.RfqSaveRequest;
import com.company.erp.rfq.buyer.request.dto.request.RfqSelectRequest;
import com.company.erp.rfq.buyer.request.dto.request.RfqSendRequest;
import com.company.erp.rfq.buyer.request.dto.response.RfqDetailResponse;
import com.company.erp.rfq.buyer.request.service.RfqBuyerRequestService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/buyer/rfqs") // 설계안이 /api/buyer/rfqs면 여기 v1 여부 통일 필요
@RequiredArgsConstructor
public class RfqBuyerRequestController {

    private final RfqBuyerRequestService service;

    private String loginUserId(HttpSession session) {
        // SessionInterceptor가 이미 인증 차단한다는 전제지만,
        // 컨트롤러 단에서 안전장치(가벼운 null 체크)만 둠
        SessionUser user = (SessionUser) session.getAttribute(SessionConst.LOGIN_USER);
        if (user == null || user.getUserId() == null || user.getUserId().isBlank()) {
            throw new UnauthorizedException("인증 세션이 유효하지 않습니다.");
        }
        return user.getUserId();
    }

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
            HttpSession session,
            @Valid @RequestBody RfqSaveRequest request) {
        String userId = loginUserId(session);
        String rfqNum = service.createRfq(request, userId);
        return ResponseEntity.ok(ApiResponse.ok(rfqNum, "견적이 생성되었습니다."));
    }

    /**
     * RFQ 저장 (T 상태에서만)
     */
    @PutMapping("/{rfqNum}")
    public ResponseEntity<ApiResponse<Void>> saveRfq(
            HttpSession session,
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSaveRequest request) {
        String userId = loginUserId(session);
        request.setRfqNum(rfqNum);
        service.saveRfq(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("저장되었습니다."));
    }

    /**
     * 업체 선정 (G 상태에서만, 단일 선정)
     */
    @PostMapping("/{rfqNum}/select")
    public ResponseEntity<ApiResponse<Void>> selectVendor(
            HttpSession session,
            @PathVariable String rfqNum,
            @Valid @RequestBody RfqSelectRequest request) {
        String userId = loginUserId(session);
        request.setRfqNum(rfqNum);
        service.selectVendor(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("업체 선정이 완료되었습니다."));
    }

    /**
     * 협력업체 전송
     */
    @PostMapping("/{rfqNum}/send")
    public ResponseEntity<ApiResponse<Void>> sendRfq(
            HttpSession session,
            @PathVariable String rfqNum,
            @RequestBody RfqSendRequest request) {
        String userId = loginUserId(session);
        service.sendRfq(rfqNum, request.getVendorCodes(), userId);
        return ResponseEntity.ok(ApiResponse.ok("전송되었습니다."));
    }

    /**
     * 견적 삭제
     */
    @DeleteMapping("/{rfqNum}")
    public ResponseEntity<ApiResponse<Void>> deleteRfq(
            HttpSession session,
            @PathVariable String rfqNum) {
        String userId = loginUserId(session);
        service.deleteRfq(rfqNum, userId);
        return ResponseEntity.ok(ApiResponse.ok("삭제되었습니다."));
    }
}
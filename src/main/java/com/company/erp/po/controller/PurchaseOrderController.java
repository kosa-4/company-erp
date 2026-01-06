package com.company.erp.po.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.company.erp.po.dto.PurchaseOrderDTO;
import com.company.erp.po.service.PurchaseOrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {
    private final PurchaseOrderService purchaseOrderService;

    //목록 조회
    @GetMapping
    public ResponseEntity<List<PurchaseOrderDTO>> getList(
            @RequestParam(required = false) String poNo, // PO_NUM
            @RequestParam(required = false) String poName, // PO_SUBJECT
            @RequestParam(required = false) String purchaseManager, // CTRL_USER_ID
            @RequestParam(required = false) String vendorName, // (VNGL 테이블 JOIN, VENDOR_NM 등)
            @RequestParam(required = false) String startDate, // PO_DATE(검색조건 시작)
            @RequestParam(required = false) String endDate, // PO_DATE(검색조건 종료)
            @RequestParam(required = false) String status // PROGRESS_CD
    ) {
        List<PurchaseOrderDTO> list = purchaseOrderService.getList(
                poNo, poName, purchaseManager, vendorName, startDate, endDate, status);
        return ResponseEntity.ok(list);
    }
    
    //상세 조회
    @GetMapping("/{no}")
    public ResponseEntity<PurchaseOrderDTO> getDetail(@PathVariable String no) {
        PurchaseOrderDTO dto = purchaseOrderService.getDetail(no);
        return ResponseEntity.ok(dto);
    }
    
    //등록
    @PostMapping
    public ResponseEntity<PurchaseOrderDTO> create(@RequestBody PurchaseOrderDTO dto) {
        PurchaseOrderDTO created = purchaseOrderService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 수정
    @PutMapping("/{no}")
    public ResponseEntity<PurchaseOrderDTO> update(
        @PathVariable String no,
        @RequestBody PurchaseOrderDTO dto
    ) {
        PurchaseOrderDTO updated = purchaseOrderService.update(no, dto);
        return ResponseEntity.ok(updated);
    }

    // 삭제
    @DeleteMapping("/{no}")
    public ResponseEntity<Void> delete(@PathVariable String no) {
        purchaseOrderService.delete(no);
        return ResponseEntity.noContent().build();
    }

    // 확정
    @PostMapping("/{no}/confirm")
    public ResponseEntity<Void> confirm(@PathVariable String no) {
        purchaseOrderService.confirm(no);
        return ResponseEntity.ok().build();
    }

    // 승인
    @PostMapping("/{no}/approve")
    public ResponseEntity<Void> approve(@PathVariable String no) {
        purchaseOrderService.approve(no);
        return ResponseEntity.ok().build();
    }

    // 반려
    @PostMapping("/{no}/reject")
    public ResponseEntity<Void> reject(
        @PathVariable String no,
        @RequestBody Map<String, String> body
    ) {
        String rejectReason = body.get("rejectReason");
        purchaseOrderService.reject(no, rejectReason);
        return ResponseEntity.ok().build();
    }

    // 발주 전송 (협력업체에게)
    @PostMapping("/{no}/send")
    public ResponseEntity<Void> send(@PathVariable String no) {
        purchaseOrderService.send(no);
        return ResponseEntity.ok().build();
    }

    // 종결
    @PostMapping("/{no}/close")
    public ResponseEntity<Void> close(@PathVariable String no) {
        purchaseOrderService.close(no);
        return ResponseEntity.ok().build();
    }
    
}

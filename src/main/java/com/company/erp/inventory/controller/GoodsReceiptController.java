package com.company.erp.inventory.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.company.erp.inventory.dto.GoodsReceiptDTO;
import com.company.erp.inventory.dto.GoodsReceiptItemDTO;
import com.company.erp.inventory.service.GoodsReceiptService;
import com.company.erp.po.dto.PurchaseOrderDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/goods-receipts")
@RequiredArgsConstructor
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    // 입고대상조회: 입고 가능한 PO 목록
    @GetMapping("/pending")
    public ResponseEntity<List<PurchaseOrderDTO>> getPendingPOList(
            @RequestParam(required = false) String poName,
            @RequestParam(required = false) String poNo,
            @RequestParam(required = false) String vendorName,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<PurchaseOrderDTO> list = goodsReceiptService.getPendingPOList(
                poNo, poName, vendorName, startDate, endDate);
        return ResponseEntity.ok(list);
    }

    // 입고현황 목록 조회
    @GetMapping
    public ResponseEntity<List<GoodsReceiptDTO>> getList(
            @RequestParam(required = false) String grNo,
            @RequestParam(required = false) String vendorName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<GoodsReceiptDTO> list = goodsReceiptService.getList(
                grNo, vendorName, status, startDate, endDate);
        return ResponseEntity.ok(list);
    }

    // 입고 상세 조회
    @GetMapping("/{grNo}")
    public ResponseEntity<GoodsReceiptDTO> getDetail(@PathVariable String grNo) {
        GoodsReceiptDTO dto = goodsReceiptService.getDetail(grNo);
        return ResponseEntity.ok(dto);
    }

    // 입고 등록
    @PostMapping
    public ResponseEntity<GoodsReceiptDTO> create(@RequestBody GoodsReceiptDTO dto) {
        GoodsReceiptDTO created = goodsReceiptService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 입고 품목 수정
    @PutMapping("/{grNo}/items/{itemCode}")
    public ResponseEntity<GoodsReceiptDTO> updateItem(
            @PathVariable String grNo,
            @PathVariable String itemCode,
            @RequestBody GoodsReceiptItemDTO item) {
        GoodsReceiptDTO updated = goodsReceiptService.updateItem(grNo, itemCode, item);
        return ResponseEntity.ok(updated);
    }

    // 입고 품목 취소
    @PostMapping("/{grNo}/items/{itemCode}/cancel")
    public ResponseEntity<GoodsReceiptDTO> cancelItem(
            @PathVariable String grNo,
            @PathVariable String itemCode,
            @RequestBody Map<String, String> body) {
        String cancelRemark = body.get("cancelRemark");
        GoodsReceiptDTO updated = goodsReceiptService.cancelItem(grNo, itemCode, cancelRemark);
        return ResponseEntity.ok(updated);
    }
}
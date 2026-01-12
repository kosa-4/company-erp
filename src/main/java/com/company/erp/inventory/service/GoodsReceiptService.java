package com.company.erp.inventory.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.inventory.constants.GoodsReceiptStatus;
import com.company.erp.inventory.dto.GoodsReceiptDTO;
import com.company.erp.inventory.dto.GoodsReceiptItemDTO;
import com.company.erp.inventory.mapper.GoodsReceiptMapper;
import com.company.erp.po.dto.PurchaseOrderDTO;
import com.company.erp.po.enums.PoStatusCode;
import com.company.erp.po.mapper.PurchaseOrderMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService {

    private final GoodsReceiptMapper goodsReceiptMapper;
    private final DocNumService docNumService;
    private final PurchaseOrderMapper purchaseOrderMapper;

    // 입고대상조회: 입고 가능한 PO 목록
    public List<PurchaseOrderDTO> getPendingPOList(
            String poNo, String poName, String vendorName, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("poNo", poNo);
        params.put("poName", poName);
        params.put("vendorName", vendorName);
        params.put("startDate", startDate);
        params.put("endDate", endDate);

        return goodsReceiptMapper.selectPendingPOList(params);
    }

    // 입고현황 목록 조회
    public List<GoodsReceiptDTO> getList(
            String grNo, String vendorName, String status, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("grNo", grNo);
        params.put("vendorName", vendorName);
        params.put("status", status);
        params.put("startDate", startDate);
        params.put("endDate", endDate);

        return goodsReceiptMapper.selectList(params);
    }

    // 입고 상세 조회
    public GoodsReceiptDTO getDetail(String grNo) {
        GoodsReceiptDTO header = goodsReceiptMapper.selectHeader(grNo);
        if (header == null) {
            throw new NoSuchElementException("입고를 찾을 수 없습니다: " + grNo);
        }

        List<GoodsReceiptItemDTO> items = goodsReceiptMapper.selectItems(grNo);
        header.setItems(items);

        return header;
    }

    // 입고 등록
    @Transactional
    public GoodsReceiptDTO create(GoodsReceiptDTO dto) {
        // 입고번호 생성
        String grNo = docNumService.generateDocNumStr(DocKey.GR);
        dto.setGrNo(grNo);

        // 입고일자가 null이면 오늘 날짜로 설정
        if (dto.getGrDate() == null) {
            dto.setGrDate(LocalDate.now());
        }

        // items null 체크
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new IllegalArgumentException("입고 품목이 없습니다.");
        }

        // 총액 계산
        BigDecimal totalAmount = dto.getItems().stream()
                .map(GoodsReceiptItemDTO::getGrAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);

        // 현재 사용자 ID 가져오기
        String currentUserId = getCurrentUserId();

        // 초기 상태 설정 (부분입고로 시작, 이후 계산하여 업데이트)
        dto.setStatus(GoodsReceiptStatus.PARTIAL);

        // 헤더 등록
        goodsReceiptMapper.insertHeader(dto, currentUserId);

        // 품목 등록
        for (GoodsReceiptItemDTO item : dto.getItems()) {
            item.setGrNo(grNo);
            // statusCode 기본값 'N' (정상입고)
            if (item.getStatusCode() == null || item.getStatusCode().isEmpty()) {
                item.setStatusCode("N");
            }
            // grDate가 null이면 현재 시간으로 설정
            if (item.getGrDate() == null) {
                item.setGrDate(LocalDateTime.now());
            }
            goodsReceiptMapper.insertItem(item);
        }

        // PO의 입고 상태 계산 및 헤더 상태 업데이트
        updateHeaderStatusByPO(dto.getPoNo(), grNo, currentUserId);

        return getDetail(grNo);
    }

    // 입고 품목 수정
    @Transactional
    public GoodsReceiptDTO updateItem(String grNo, String itemCode, GoodsReceiptItemDTO item) {
        // 기존 입고 확인
        GoodsReceiptDTO existing = goodsReceiptMapper.selectHeader(grNo);
        if (existing == null) {
            throw new NoSuchElementException("입고를 찾을 수 없습니다: " + grNo);
        }

        item.setGrNo(grNo);
        item.setItemCode(itemCode);

        // 현재 사용자 ID 가져오기
        String currentUserId = getCurrentUserId();

        // 품목 수정
        goodsReceiptMapper.updateItem(item, currentUserId);

        // 헤더 총액 재계산
        recalculateHeaderAmount(grNo, currentUserId);

        // PO의 입고 상태 재계산
        updateHeaderStatusByPO(existing.getPoNo(), grNo, currentUserId);

        return getDetail(grNo);
    }

    // 입고 품목 취소
    @Transactional
    public GoodsReceiptDTO cancelItem(String grNo, String itemCode, String cancelRemark) {
        // 기존 입고 확인
        GoodsReceiptDTO existing = goodsReceiptMapper.selectHeader(grNo);
        if (existing == null) {
            throw new NoSuchElementException("입고를 찾을 수 없습니다: " + grNo);
        }

        // 취소 사유 필수 검증
        if (cancelRemark == null || cancelRemark.isBlank()) {
            throw new IllegalArgumentException("취소 사유는 필수입니다.");
        }

        // 현재 사용자 ID 가져오기
        String currentUserId = getCurrentUserId();

        // 품목 취소 처리
        goodsReceiptMapper.cancelItem(grNo, itemCode, cancelRemark, currentUserId);

        // 모든 품목이 취소되었는지 확인
        boolean allCancelled = goodsReceiptMapper.isAllItemsCancelled(grNo);
        if (allCancelled) {
            // 모든 품목이 취소되면 헤더 상태를 입고취소로 변경
            goodsReceiptMapper.updateHeaderStatus(grNo, GoodsReceiptStatus.CANCELLED, currentUserId);
        } else {
            // PO의 입고 상태 재계산
            updateHeaderStatusByPO(existing.getPoNo(), grNo, currentUserId);
        }

        return getDetail(grNo);
    }

    // 헤더 총액 재계산
    private void recalculateHeaderAmount(String grNo, String userId) {
        List<GoodsReceiptItemDTO> items = goodsReceiptMapper.selectItems(grNo);
        BigDecimal totalAmount = items.stream()
                .filter(item -> "N".equals(item.getStatusCode())) // 정상 상태만
                .map(GoodsReceiptItemDTO::getGrAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        GoodsReceiptDTO header = goodsReceiptMapper.selectHeader(grNo);
        if (header != null) {
            header.setTotalAmount(totalAmount);
            // 총액 업데이트는 별도 Mapper 메서드가 필요할 수 있음
            // 현재는 헤더 조회 시 자동 계산되므로 생략 가능
        }
    }

    // PO의 입고 상태에 따라 헤더 상태 업데이트
    private void updateHeaderStatusByPO(String poNo, String grNo, String userId) {
        if (poNo == null || poNo.isEmpty()) {
            return;
        }

        // PO의 누적 입고수량 조회
        BigDecimal accumulatedQty = goodsReceiptMapper.selectAccumulatedQty(poNo);

        // PO의 발주수량 합계 조회
        BigDecimal orderQty = goodsReceiptMapper.selectOrderQty(poNo);

        // 상태 결정
        String newStatus;
        if (accumulatedQty.compareTo(BigDecimal.ZERO) == 0) {
            // 입고수량이 0이면 미입고
            newStatus = GoodsReceiptStatus.NOT_RECEIVED;
        } else if (accumulatedQty.compareTo(orderQty) >= 0) {
            // 입고수량 >= 발주수량: 입고완료
            newStatus = GoodsReceiptStatus.COMPLETED;
        } else {
            // 입고수량 < 발주수량: 부분입고
            newStatus = GoodsReceiptStatus.PARTIAL;
        }

        // 헤더 상태 업데이트
        goodsReceiptMapper.updateHeaderStatus(grNo, newStatus, userId);

        // 입고완료(GRE) 상태가 되면 PO 상태를 'C'(완료)로 자동 변경
        if (GoodsReceiptStatus.COMPLETED.equals(newStatus)) {
            purchaseOrderMapper.updateStatus(poNo, PoStatusCode.DELIVERED.getCode(), userId);
        }
    }

    // 현재 사용자 ID 가져오기 (인증 정보에서)
    // TODO: 실제 인증 시스템 연동 시 구현 필요
    private String getCurrentUserId() {
        // 실제 인증 정보에서 사용자 ID 가져오기
        return "SYSTEM"; // 임시값 - 실제 구현 시 제거
    }
}

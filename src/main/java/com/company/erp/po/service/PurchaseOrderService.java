package com.company.erp.po.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.erp.po.dto.PurchaseOrderDTO;
import com.company.erp.po.dto.PurchaseOrderItemDTO;
import com.company.erp.po.enums.*;
import com.company.erp.po.mapper.PurchaseOrderMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderMapper purchaseOrderMapper;
    private final DocNoService docNoService;

    // 목록 조회
    public List<PurchaseOrderDTO> getList(
            String poNo, String poName,
            String purchaseManager, String vendorName,
            String startDate, String endDate, String status) {
        Map<String, Object> params = new HashMap<>();
        params.put("poNo", poNo);
        params.put("poName", poName);
        params.put("purchaseManager", purchaseManager);
        params.put("vendorName", vendorName);
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        params.put("status", status);
        
        List<PurchaseOrderDTO> list = purchaseOrderMapper.selectList(params);

        // 상태값 변환 (코드 -> 표시명)
        list.forEach(dto -> {
            if (dto.getStatus() != null) {
                dto.setStatus(PoStatusCode.toDisplayName(dto.getStatus()));
            }
            if (dto.getPurchaseType() != null) {
                dto.setPurchaseType(PurchaseType.toDisplayName(dto.getPurchaseType()));
            }
        });
        return list;
    }

    // 상세 조회
    public PurchaseOrderDTO getDetail(String poNo) {
        PurchaseOrderDTO header = purchaseOrderMapper.selectHeader(poNo);
        if (header == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다: " + poNo);   
        }
        
        List<PurchaseOrderItemDTO> items = purchaseOrderMapper.selectItems(poNo);
        header.setItems(items);

        // 상태값 변환
        if (header.getStatus() != null) {
            header.setStatus(PoStatusCode.toDisplayName(header.getStatus()));
        }
        if (header.getPurchaseType() != null) {
            header.setPurchaseType(PurchaseType.toDisplayName(header.getPurchaseType()));
        }
        return header;   
    }

    // 등록
    @Transactional
    public PurchaseOrderDTO create(PurchaseOrderDTO dto) {
        // 발주번호 생성
        String poNo = docNoService.generatePoNo();
        dto.setPoNo(poNo);
        
        // poDate가 null 이면 오늘 날짜로 설정
        if (dto.getPoDate() == null) {
            dto.setPoDate(LocalDate.now());
        }
        
        // 상태값 변환 (표시명 -> 코드)
        dto.setStatus(PoStatusCode.toCode(dto.getStatus() != null ? dto.getStatus() : "저장"));
        dto.setPurchaseType(PurchaseType.toCode(dto.getPurchaseType() != null ? dto.getPurchaseType() : "일반"));
        
        // items null 체크
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new IllegalArgumentException("발주 품목이 없습니다.");
        }

        // 총액 계산
        BigDecimal totalAmount = dto.getItems().stream()
            .map(PurchaseOrderItemDTO::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);

        // 현재 사용자 ID 가져오기 
        String currentUserId = getCurrentUserId();

        // 헤더 등록 (regUserId 별도 전달)
        purchaseOrderMapper.insertHeader(dto, currentUserId);

        // 품목 등록
        for (PurchaseOrderItemDTO item : dto.getItems()) {
            item.setPoNo(poNo);
            purchaseOrderMapper.insertItem(item, currentUserId);
        }
        return getDetail(poNo);
    }

     // 현재 사용자 ID 가져오기 (인증 정보에서)
    // TODO: 실제 인증 시스템 연동 시 구현 필요
    // - 세션: HttpSession에서 사용자 정보 가져오기
    private String getCurrentUserId() {
        // 실제 인증 정보에서 사용자 ID 가져오기
        return "SYSTEM"; // 임시값 - 실제 구현 시 제거
    }

    // 수정
    @Transactional
    public PurchaseOrderDTO update(String poNo, PurchaseOrderDTO dto) {
        // 기존 발주 확인
        PurchaseOrderDTO existing = purchaseOrderMapper.selectHeader(poNo);
        if (existing == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다 : " + poNo);
        }

        dto.setPoNo(poNo);
        dto.setPurchaseType(PurchaseType.toCode(dto.getPurchaseType()));
        
        // 총액 재계산
        BigDecimal totalAmount = dto.getItems().stream()
        .map(PurchaseOrderItemDTO::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);

        // 현재 사용자 ID 가져오기
        String currentUserId = getCurrentUserId();

        // 헤더 수정 (modUserId 별도 전달)
        purchaseOrderMapper.updateHeader(dto, currentUserId);

        // 기존 품목 삭제 후 재동록
        purchaseOrderMapper.deleteItems(poNo);
        for (PurchaseOrderItemDTO item : dto.getItems()) {
            item.setPoNo(poNo);
            purchaseOrderMapper.insertItem(item, currentUserId);
        }

        return getDetail(poNo);
    }

    // 삭제
    @Transactional
    public Boolean delete(String poNo) {
        PurchaseOrderDTO existing = purchaseOrderMapper.selectHeader(poNo);
        if (existing == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다: " + poNo);
        }

        purchaseOrderMapper.deleteHeader(poNo);
        purchaseOrderMapper.deleteItems(poNo);
        return true;
    }

    // 확정
    @Transactional
    public Boolean confirm(String poNo) {
        String currentUserId = getCurrentUserId();
        return updateStatus(poNo, PoStatusCode.CONFIRMED.getCode(), currentUserId);
    }

    // 승인
    @Transactional
    public Boolean approve(String poNo) {
        String currentUserId = getCurrentUserId();
        return updateStatus(poNo, PoStatusCode.APPROVED.getCode(), currentUserId);
    }

    // 반려
    @Transactional
    public Boolean reject(String poNo, String rejectReason) {
        // 반려 상태는 별도 처리 필요 (현재는 상태 변경만)
        String currentUserId = getCurrentUserId();
        return updateStatus(poNo, PoStatusCode.SAVED.getCode(), currentUserId);
    }

    // 발주 전송
    @Transactional
    public Boolean send(String poNo) {
        String currentUserId = getCurrentUserId();
        return updateStatus(poNo, PoStatusCode.SENT.getCode(), currentUserId);
    }

    // 종결
    @Transactional
    public Boolean close(String poNo) {
        String currentUserId = getCurrentUserId();
        return updateStatus(poNo, PoStatusCode.CLOSED.getCode(), currentUserId);
    }

    // 상태 변경 공통 메서드
    private Boolean updateStatus(String poNo, String status, String userId) {
        PurchaseOrderDTO existing = purchaseOrderMapper.selectHeader(poNo);
        if (existing == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다: " + poNo);
        }

        purchaseOrderMapper.updateStatus(poNo, status, userId);
        return true;
    }

}

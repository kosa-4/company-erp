package com.company.erp.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

/**
 * 입고대상 DTO
 * 
 * 설계 문서 기준:
 * - 발주 완료된 품목 중 미입고/부분입고 대상
 * - 입고대상조회 화면의 그리드 데이터
 */
@Data
public class ReceivingTargetDTO {
    // 발주 정보
    private String poNo;              // PO번호
    private String poName;            // 발주명
    private String buyer;             // 발주담당자
    private LocalDate poDate;         // 발주일자
    
    // 협력사 정보
    private String vendorCode;        // 협력사코드
    private String vendorName;        // 협력사명
    
    // 품목 정보
    private String itemCode;          // 품목코드
    private String itemName;         // 품목명
    private String spec;              // 규격
    private String unit;              // 단위
    private BigDecimal unitPrice;    // 단가
    private Integer orderQuantity;    // 발주수량
    private String storageLocation;   // 저장위치
    private BigDecimal amount;       // 금액
}

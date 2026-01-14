package com.company.erp.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GoodsReceiptItemDTO {
    // === 저장 대상 필드 (GRDT) ===
    private String grNo; // 입고번호 (FK)
    private String itemCode; // 품목코드 (PK)
    private String itemDesc; // 품목명
    private String itemSpec; // 규격
    private String unitCode; // 단위
    private BigDecimal grQuantity; // 입고수량
    private BigDecimal grAmount; // 입고금액
    private String vendorCode; // 협력사코드
    private String ctrlUserId; // 입고담당자
    private String warehouseCode; // 저장위치
    private LocalDateTime grDate; // 실제 입고일시
    private String remark; // 비고
    private String statusCode; // N/C
    private String cancelRemark; // 취소사유
    private String ctrlDeptCd; // 담당자 부서 - DB: CTRL_DEPT_CD

    // === PODT JOIN 정보 (조회용) ===
    private BigDecimal unitPrice; // 단가
    private BigDecimal orderQty; // 발주수량
    private BigDecimal orderAmount; // 발주금액
    private BigDecimal accumulatedQty; // 누적입고수량

    // === 조회용 JOIN ===
    private String vendorName; // 협력사명
}
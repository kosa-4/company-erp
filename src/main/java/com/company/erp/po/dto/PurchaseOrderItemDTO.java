package com.company.erp.po.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class PurchaseOrderItemDTO {
    private String poNo; // 발주번호 - DB: PO_NUM
    private String itemCode; // 품목코드 - DB: ITEM_CD
    private String itemName; // 품목명 - DB: ITEM_DESC
    private String specification; // 규격 - DB: ITEM_SPEC
    private String unit; // 단위 - DB: UNIT_CD
    private Integer orderQuantity; // 발주수량 - DB: PO_QT
    private Integer remainingQuantity; // 남은 입고 가능 수량 (발주수량 - 입고수량)
    private BigDecimal unitPrice; // 단가 - DB: UNIT_PRC
    private BigDecimal amount; // 금액 - DB: PO_AMT
    private LocalDate deliveryDate; // 희망납기일 - DB: DELY_DATE
    private String paymentTerms; // 결제조건 - DB: TERM_PAY
    private String storageLocation; // 저장위치 - DB: WH_CD
    private String remark; // 비고 - DB: RMK
    private String vendorCode; // 협력사코드
    private String vendorName; // 협력사명

    // 입고대상조회용: 기존 GR의 저장위치 (품목별 입고번호 기준)
    private String existingGrWarehouse; // 기존 입고가 있으면 해당 저장위치, 없으면 null
}

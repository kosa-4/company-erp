package com.company.erp.po.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class PurchaseOrderDTO {
    // Header (POHD) - API 명세서 필드명 기준
    private String poNo; // 발주번호 (PK) - DB: PO_NUM
    private String poName; // 발주명 - DB: PO_SUBJECT
    private LocalDate poDate; // 발주일자 - DB: PO_DATE
    private BigDecimal totalAmount; // 발주금액 - DB: PO_AMT
    private String status; // 진행상태 - DB: PROGRESS_CD (변환 필요)
    private String approvalStatus; // 승인상태 (승인대기/승인/반려)
    private String purchaseManager; // 담당자명 - DB: CTRL_USER_ID (JOIN으로 이름 조회)
    private String vendorCode; // 협력사코드 - DB: VENDOR_CD
    private String vendorName; // 협력사명 (VNGL 테이블 JOIN)
    private String prNo; // 구매요청번호 - DB: PR_NUM
    private String rfqNo; // 견적요청번호 - DB: RFQ_NUM
    private String purchaseType; // 구매유형 - DB: PC_TYPE (일반/단가계약/긴급구매)
    private String remark; // 비고 - DB: RMK
    private String checkFlag; // 협력사 확인여부 - DB: CHECK_FLAG
    private LocalDateTime checkDate; // 확인일자 - DB: CHECK_DATE
    private String ctrlDeptCd; // 담당자 부서 - DB: CTRL_DEPT_CD

    // 상세 품목 리스트
    private List<PurchaseOrderItemDTO> items;

    // 추가: 목록 조회 시 표시할 총 입고 수량
    private BigDecimal receivedQuantity;
}
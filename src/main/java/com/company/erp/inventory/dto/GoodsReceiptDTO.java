package com.company.erp.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class GoodsReceiptDTO {
    // === 저장 대상 필드 (GRHD) ===
    private String grNo; // 입고번호 (PK)
    private String poNo; // 발주번호 (FK)
    private LocalDate grDate; // 입고일자 (업무일)
    private BigDecimal totalAmount; // 입고금액
    private String status; // 상태코드
    private String remark; // 비고
    // private String attFileNum; // 첨부파일 (필요시 추가)

    // === 조회용 JOIN 필드 (입고현황 목록 등) ===
    private String vendorName; // 협력사명
    private String ctrlUserName; // 대표 담당자명 (첫 DT 기준 또는 등록자)
    private String ctrlDeptCd; // 담당자 부서 - DB: CTRL_DEPT_CD
    private String poStatus; // 발주 상태 (종결 여부 확인용)

    // === 상세 ===
    private List<GoodsReceiptItemDTO> items;
}
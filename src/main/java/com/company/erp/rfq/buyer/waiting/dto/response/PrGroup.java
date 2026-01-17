package com.company.erp.rfq.buyer.waiting.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 견적대기목록 그룹 (PR 단위)
 */
@Getter
@Setter
public class PrGroup {
    // PR 헤더 정보
    private String prNum;
    private String prSubject;
    private LocalDate prDate;
    private String requester;
    private String reqDeptNm;
    private String progressCd;
    private String progressNm;
    private String pcType;
    private String pcTypeNm;

    // 집계 정보
    private Integer itemCount;
    private BigDecimal totalAmount;

    // PR 품목 리스트
    private List<PrItemRow> items;
}

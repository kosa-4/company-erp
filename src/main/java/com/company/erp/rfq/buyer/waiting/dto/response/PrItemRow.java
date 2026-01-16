package com.company.erp.rfq.buyer.waiting.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 견적대기목록 품목 Row
 */
@Getter
@Setter
public class PrItemRow {
    private String prNum; // ✅ 필수! groupingBy에서 사용
    private Integer lineNo;
    private String itemCd;
    private String itemDesc;
    private String itemSpec;
    private String unitCd;
    private BigDecimal prQt;
    private BigDecimal unitPrc;
    private BigDecimal prAmt;
    private LocalDate delyDate;
    private String rmk;
}

package com.company.erp.rfq.vendor.quote.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 협력사 견적 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorQuoteResponse {

    // RFQ 헤더 정보
    private String rfqNum;
    private String rfqSubject;
    private LocalDateTime rfqDate;
    private LocalDateTime reqCloseDate;
    private String progressCd;
    private String vendorProgressCd;

    // 견적 품목 목록
    private List<QuoteItemInfo> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuoteItemInfo {
        private Integer lineNo;
        private String itemCd;
        private String itemDesc;
        private String itemSpec;
        private String unitCd;
        private BigDecimal rfqQt; // 요청수량
        private String quoteUnitPrc; // 견적단가
        private BigDecimal quoteQt; // 견적수량
        private String quoteAmt; // 견적금액
        private LocalDate delyDate; // 납기가능일
        private String rmk; // 비고
    }
}

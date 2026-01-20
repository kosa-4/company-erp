package com.company.erp.rfq.vendor.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 협력사 RFQ 상세 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorRfqDetailResponse {

    // RFQ 헤더 정보
    private String rfqNum;
    private String rfqSubject;
    private LocalDateTime rfqDate;
    private LocalDateTime reqCloseDate;
    private String progressCd;
    private String progressName;
    private String vendorProgressCd;
    private String vendorProgressName;
    private String rfqType;
    private String rfqTypeName;
    private String rmk;

    // 품목 목록
    private List<RfqItemInfo> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RfqItemInfo {
        private Integer lineNo;
        private String itemCd;
        private String itemDesc;
        private String itemSpec;
        private String unitCd;
        private BigDecimal rfqQt;
        private BigDecimal estUnitPrc;
        private BigDecimal estAmt;
        private LocalDate delyDate;
        private String whNm;
        private String rmk;
    }
}

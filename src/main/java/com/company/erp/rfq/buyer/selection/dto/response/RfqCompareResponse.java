package com.company.erp.rfq.buyer.selection.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RfqCompareResponse {
    private String rfqNo;
    private String rfqName;
    private List<Item> items;
    private List<Vendor> vendors;
    private List<Quote> quotes;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class Item {
        private Integer lineNo;
        private String itemCd;
        private String itemDesc;
        private String itemSpec;
        private String unitCd;
        private BigDecimal qty;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class Vendor {
        private String vendorCd;
        private String vendorNm;
        private String selectYn; // 'Y'|'N'
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class Quote {
        private String vendorCd;
        private Integer lineNo;
        private BigDecimal unitPrice;
        private BigDecimal quoteQt;
        private BigDecimal amount;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class RfqCompareQuoteRow {
        private String vendorCd;
        private Integer lineNo;

        private BigDecimal quoteQt;

        // 암호문(문자열)
        private String unitPriceEnc;
        private String amountEnc;
    }
}

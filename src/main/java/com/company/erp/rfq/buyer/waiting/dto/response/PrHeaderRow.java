package com.company.erp.rfq.buyer.waiting.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class PrHeaderRow {
    private String prNum;
    private String prSubject;
    private LocalDate prDate;
    private String requester;
    private String reqDeptNm;
    private String progressCd;
    private String progressNm;
    private String pcType;
    private String pcTypeNm;
    private Integer itemCount;
    private BigDecimal totalAmount;
}

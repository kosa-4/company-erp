package com.company.erp.rfq.buyer.waiting.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RfqWaitingSearchRequest {
    private String prNum;
    private String prSubject;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String reqDeptCd;
    private String reqUserNm;
}

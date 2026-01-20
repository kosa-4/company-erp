package com.company.erp.rfq.buyer.waiting.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RfqWaitingSearchRequest {
    private String prNum;
    private String prSubject;
    private LocalDate reqDate;
    private String reqDeptCd;
    private String reqUserNm;
}

package com.company.erp.rfq.buyer.waiting.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrLockRow {
    private String prNum;
    private String progressCd;
    private String pcType;
    private String reqDeptCd;
    private String ctrlUserId;
}

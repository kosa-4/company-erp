package com.company.erp.rfq.buyer.selection.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 협력업체 선정 목록용 DTO
 */
@Getter
@Setter
public class RfqSelectionResponse {
    private String rfqNum;
    private String rfqSubject;
    private String rfqType;
    private String rfqTypeNm;
    private String progressCd;
    private String progressNm;
    private String ctrlUserId;
    private String ctrlUserNm;
    private LocalDateTime regDate;

    private String vendorCd;
    private String vendorNm;
    private String vnProgressCd;
    private String vnProgressNm;
    private LocalDateTime sendDate;
    private LocalDateTime submitDate;
    private String totalAmt;
    private String selectYn;
    private String rmk;
}

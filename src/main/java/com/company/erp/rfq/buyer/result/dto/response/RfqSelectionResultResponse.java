package com.company.erp.rfq.buyer.result.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RfqSelectionResultResponse {
    private String rfqNum; // RFQ 번호
    private String rfqSubject; // 견적명
    private String rfqType; // 견적유형
    private String rfqTypeNm; // 견적유형명
    private String vendorCd; // 협력사코드
    private String vendorNm; // 협력사명
    private String totalAmt; // 총 견적금액
    private String ctrlUserId; // 구매담당자 ID
    private String ctrlUserNm; // 구매담당자명
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String regDate; // 등록일

    @JsonFormat(pattern = "yyyy-MM-dd")
    private String selectDate; // 선정일 (MOD_DATE 활용)
}

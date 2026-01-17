package com.company.erp.rfq.buyer.progress.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RfqProgressSearchRequest {
    private String rfqNum; // RFQ 번호
    private String rfqSubject; // 견적명
    private String fromDate; // 시작일
    private String toDate; // 종료일
    private String progressCd; // 헤더 상태 코드
    private String rfqType; // 견적 유형
    private String ctrlUserNm; // 구매 담당자명
}

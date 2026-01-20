package com.company.erp.rfq.buyer.progress.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RfqProgressGroupResponse {
    private String rfqNum; // RFQ 번호
    private String rfqSubject; // 견적명
    private String rfqDate; // 등록일 (정상 포맷)
    private String rfqType; // 견적유형 코드
    private String rfqTypeNm; // 견적유형 명칭
    private String progressCd; // 헤더 상태 코드
    private String progressNm; // 헤더 상태 명칭
    private String ctrlUserNm; // 구매 담당자명
    private String regDate; // 등록 일시 (정렬용)

    private List<VendorStatus> vendors; // 하위 협력사 리스트

    @Getter
    @Setter
    public static class VendorStatus {
        private String vendorCd;
        private String vendorNm;
        private String progressCd;
        private String progressNm;
        private String sendDate;
        private String submitDate;
    }
}

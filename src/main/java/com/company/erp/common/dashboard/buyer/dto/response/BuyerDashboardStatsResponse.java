package com.company.erp.common.dashboard.buyer.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuyerDashboardStatsResponse {
    private long prCount; // 이번 달 구매요청
    private long activeRfqCount; // 진행중 견적
    private long poCompletedCount; // 발주 완료
    private long grWaitingCount; // 입고 대기
    private long rfqPendingCount; // 견적 대기 (PR 승인 완료, RFQ 미생성)
    private long poPendingCount; // 발주 대기 (RFQ 선정 완료, PO 미생성)
    private long pendingProcessCount; // 처리 대기 배지
    private long pendingApprovalCount; // 승인 대기 배지

    private String prChange;
    private String rfqChange;
    private String poChange;
    private String grChange;
}

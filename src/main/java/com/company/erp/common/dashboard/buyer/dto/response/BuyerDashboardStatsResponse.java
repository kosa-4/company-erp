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
    private long pendingProcessCount; // 처리 대기 배지
    private long pendingApprovalCount; // 승인 대기 배지

    private String prChange;
    private String rfqChange;
    private String poChange;
    private String grChange;
}

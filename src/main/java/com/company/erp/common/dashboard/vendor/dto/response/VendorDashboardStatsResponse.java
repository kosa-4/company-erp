package com.company.erp.common.dashboard.vendor.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorDashboardStatsResponse {
    private long waitingRfqCount; // 답변 대기 견적
    private long submittedRfqCount; // 제출 완료 견적
    private long receivedPoCount; // 수신 발주 건수
    private long selectedRfqCount; // 최종 낙찰(선정) 건수

    private long pendingActionCount; // 처리 대기 (새 요청 등)
    private long infoNoticeCount; // 공지사항 등 (더미 가능)

    private String rfqChange;
    private String poChange;
}

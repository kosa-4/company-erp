package com.company.erp.common.dashboard.buyer.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityResponse {
    private String type; // 'request', 'rfq', 'order', 'receiving'
    private String title;
    private String description;
    private String time; // "5분 전" 등
    private String regDate; // 정렬용 원본 날짜
}

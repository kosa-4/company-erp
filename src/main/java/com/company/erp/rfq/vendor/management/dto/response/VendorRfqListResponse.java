package com.company.erp.rfq.vendor.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 협력사 RFQ 목록 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorRfqListResponse {

    private String rfqNum; // 견적번호
    private String rfqSubject; // 견적명
    private String rfqDate; // 견적일자
    private String reqCloseDate; // 마감일
    private String progressCd; // RFQ 전체 상태 (RFQHD)
    private String progressName; // RFQ 전체 상태명
    private String vendorProgressCd; // 협력사별 상태 (RFQVN)
    private String vendorProgressName; // 협력사별 상태명
    private Integer itemCount; // 품목 수
    private String rfqType; // 견적 유형 (OC: 수의계약, AC: 지명경쟁)
    private String rfqTypeName; // 견적 유형명
    private String selectYn; // 선정 여부 (Y: 선정, N: 미선정)
}

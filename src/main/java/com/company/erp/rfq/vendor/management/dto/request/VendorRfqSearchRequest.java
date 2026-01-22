package com.company.erp.rfq.vendor.management.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 협력사 RFQ 검색 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorRfqSearchRequest {

    private String searchText; // 검색어 (견적번호, 견적명)
    private String progressCd; // 상태 필터 (RFQVN.PROGRESS_CD)
    private String rfqDate;
    private String reqCloseDate;
}

package com.company.erp.rfq.buyer.vendor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqVendorListResponse {
    private List<RfqVendorDTO> vendors;
    private int totalCount;
}

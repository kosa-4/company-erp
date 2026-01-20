package com.company.erp.rfq.buyer.vendor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfqVendorDTO {
    private String vendorCode;
    private String vendorName;
    private String ceoName;
    private String address;
    private String industry;
    private String status;
}

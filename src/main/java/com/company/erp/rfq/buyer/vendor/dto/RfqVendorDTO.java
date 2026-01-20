package com.company.erp.rfq.buyer.vendor.dto;

import lombok.Data;

@Data
public class RfqVendorDTO {
    private String vendorCode;
    private String vendorName;
    private String ceoName;
    private String address;
    private String industry;
    private String status;
}

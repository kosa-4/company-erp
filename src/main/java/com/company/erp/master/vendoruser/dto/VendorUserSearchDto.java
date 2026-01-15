package com.company.erp.master.vendoruser.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class VendorUserSearchDto {
    private String vendorCode;
    private String vendorName;
    private String userId;
    private String userName;
    private String phone;
    private String email;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String blockFlag;
}

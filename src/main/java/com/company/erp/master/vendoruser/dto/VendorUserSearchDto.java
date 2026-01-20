package com.company.erp.master.vendoruser.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VendorUserSearchDto {
    private String vendorCode;
    private String vendorName;
    private String userId;
    private String userName;
    private String phone;
    private String email;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String blockFlag;
}

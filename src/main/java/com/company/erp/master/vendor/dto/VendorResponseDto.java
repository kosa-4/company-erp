package com.company.erp.master.vendor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class VendorResponseDto<T> {
    private List<T> vendors;
    private int page;
    private int pageSize;
    private int totalPage;
    private int totalCount;
}

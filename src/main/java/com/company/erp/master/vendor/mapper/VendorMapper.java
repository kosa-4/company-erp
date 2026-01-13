package com.company.erp.master.vendor.mapper;

import com.company.erp.master.vendor.dto.VendorListDto;
import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendor.dto.VendorSearchDto;

import java.util.List;

public interface VendorMapper {
    /* 조회 */
    List<VendorListDto> selectVendorList(VendorSearchDto vendorSearchDto);

    /* 저장 */
    void insertVendorVNGL(VendorRegisterDto vendorRegisterDto);
    boolean existsByBusinessNo(String businessNo);
}

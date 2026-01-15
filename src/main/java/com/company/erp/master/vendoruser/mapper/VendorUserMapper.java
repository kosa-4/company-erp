package com.company.erp.master.vendoruser.mapper;

import com.company.erp.master.vendor.dto.VendorRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserListDto;
import com.company.erp.master.vendoruser.dto.VendorUserRegisterDto;
import com.company.erp.master.vendoruser.dto.VendorUserSearchDto;

import java.util.List;

public interface VendorUserMapper {
    // === 구매사 ===
    List<VendorUserListDto> selectVendorUserList(VendorUserSearchDto VendorUserSearchDto);
    // === 협력사 ===
    void insertUserVNCH_US(VendorUserRegisterDto vendorUserRegisterDto);
    boolean existsUserId(String userId);
}

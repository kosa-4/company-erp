package com.company.erp.rfq.buyer.vendor.mapper;

import com.company.erp.rfq.buyer.vendor.dto.RfqVendorDTO;
import com.company.erp.rfq.buyer.vendor.dto.RfqVendorSearchRequest;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface RfqBuyerVendorMapper {
    List<RfqVendorDTO> selectApprovedVendors(RfqVendorSearchRequest request);
}

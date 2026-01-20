package com.company.erp.rfq.buyer.vendor.service;

import com.company.erp.rfq.buyer.vendor.dto.RfqVendorDTO;
import com.company.erp.rfq.buyer.vendor.dto.RfqVendorListResponse;
import com.company.erp.rfq.buyer.vendor.dto.RfqVendorSearchRequest;
import com.company.erp.rfq.buyer.vendor.mapper.RfqBuyerVendorMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RfqBuyerVendorService {

    private final RfqBuyerVendorMapper mapper;

    @Transactional(readOnly = true)
    public RfqVendorListResponse getApprovedVendors(RfqVendorSearchRequest request) {
        // 페이징이나 카운트 없이 단순 리스트 반환 (필요 시 확장)
        List<RfqVendorDTO> vendors = mapper.selectApprovedVendors(request);
        return RfqVendorListResponse.builder()
                .vendors(vendors)
                .totalCount(vendors.size()) // 전체 카운트 쿼리는 생략 (단순 목록)
                .build();
    }
}

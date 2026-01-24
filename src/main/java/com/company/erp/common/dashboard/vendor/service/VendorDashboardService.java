package com.company.erp.common.dashboard.vendor.service;

import com.company.erp.common.dashboard.vendor.dto.response.VendorDashboardStatsResponse;
import com.company.erp.common.dashboard.buyer.dto.response.RecentActivityResponse;
import com.company.erp.common.dashboard.vendor.mapper.VendorDashboardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorDashboardService {

    private final VendorDashboardMapper dashboardMapper;

    public VendorDashboardStatsResponse getDashboardStats(String vendorCd) {
        return dashboardMapper.getDashboardStats(vendorCd);
    }

    public List<RecentActivityResponse> getRecentActivities(String vendorCd) {
        return dashboardMapper.getRecentActivities(vendorCd);
    }
}

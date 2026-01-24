package com.company.erp.common.dashboard.buyer.service;

import com.company.erp.common.dashboard.buyer.dto.response.BuyerDashboardStatsResponse;
import com.company.erp.common.dashboard.buyer.dto.response.RecentActivityResponse;
import com.company.erp.common.dashboard.buyer.mapper.BuyerDashboardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BuyerDashboardService {

    private final BuyerDashboardMapper dashboardMapper;

    public BuyerDashboardStatsResponse getDashboardStats() {
        return dashboardMapper.getDashboardStats();
    }

    public List<RecentActivityResponse> getRecentActivities() {
        return dashboardMapper.getRecentActivities();
    }
}

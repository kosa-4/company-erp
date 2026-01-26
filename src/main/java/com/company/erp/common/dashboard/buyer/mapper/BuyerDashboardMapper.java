package com.company.erp.common.dashboard.buyer.mapper;

import com.company.erp.common.dashboard.buyer.dto.response.BuyerDashboardStatsResponse;
import com.company.erp.common.dashboard.buyer.dto.response.RecentActivityResponse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BuyerDashboardMapper {
    // 주요 통계 집계
    BuyerDashboardStatsResponse getDashboardStats();

    // 최근 활동 이력 5건
    List<RecentActivityResponse> getRecentActivities();
}

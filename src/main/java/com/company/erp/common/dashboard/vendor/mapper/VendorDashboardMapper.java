package com.company.erp.common.dashboard.vendor.mapper;

import com.company.erp.common.dashboard.vendor.dto.response.VendorDashboardStatsResponse;
import com.company.erp.common.dashboard.buyer.dto.response.RecentActivityResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface VendorDashboardMapper {
    // 협력사 통계 집계
    VendorDashboardStatsResponse getDashboardStats(@Param("vendorCd") String vendorCd);

    // 협력사 최근 활동 이력
    List<RecentActivityResponse> getRecentActivities(@Param("vendorCd") String vendorCd);
}

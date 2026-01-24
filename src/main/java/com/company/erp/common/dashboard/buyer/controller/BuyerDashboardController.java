package com.company.erp.common.dashboard.buyer.controller;

import com.company.erp.common.dashboard.buyer.dto.response.BuyerDashboardStatsResponse;
import com.company.erp.common.dashboard.buyer.dto.response.RecentActivityResponse;
import com.company.erp.common.dashboard.buyer.service.BuyerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard/buyer")
@RequiredArgsConstructor
public class BuyerDashboardController {

    private final BuyerDashboardService dashboardService;

    @GetMapping("/total-data")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> result = new HashMap<>();
        result.put("stats", dashboardService.getDashboardStats());
        result.put("activities", dashboardService.getRecentActivities());

        return ResponseEntity.ok(result);
    }
}

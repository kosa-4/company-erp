package com.company.erp.common.dashboard.vendor.controller;

import com.company.erp.common.dashboard.vendor.dto.response.VendorDashboardStatsResponse;
import com.company.erp.common.dashboard.buyer.dto.response.RecentActivityResponse;
import com.company.erp.common.dashboard.vendor.service.VendorDashboardService;
import com.company.erp.common.exception.UnauthorizedException;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard/vendor")
@RequiredArgsConstructor
public class VendorDashboardController {

    private final VendorDashboardService dashboardService;

    private SessionUser getSessionUser(HttpSession session) {
        SessionUser user = (SessionUser) session.getAttribute(SessionConst.LOGIN_USER);
        if (user == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return user;
    }

    @GetMapping("/total-data")
    public ResponseEntity<Map<String, Object>> getDashboardData(HttpSession session) {
        SessionUser user = getSessionUser(session);
        String vendorCd = user.getVendorCd();

        if (vendorCd == null || vendorCd.isEmpty()) {
            throw new UnauthorizedException("협력사 정보가 없습니다.");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("stats", dashboardService.getDashboardStats(vendorCd));
        result.put("activities", dashboardService.getRecentActivities(vendorCd));

        return ResponseEntity.ok(result);
    }
}

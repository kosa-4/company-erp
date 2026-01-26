package com.company.erp.common.dashboard.buyer.service;

import com.company.erp.common.dashboard.buyer.dto.response.BuyerDashboardStatsResponse;
import com.company.erp.common.dashboard.buyer.dto.response.RecentActivityResponse;
import com.company.erp.common.dashboard.buyer.mapper.BuyerDashboardMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuyerDashboardService {

    private final BuyerDashboardMapper dashboardMapper;

    public BuyerDashboardStatsResponse getDashboardStats() {
        return dashboardMapper.getDashboardStats();
    }

    public List<RecentActivityResponse> getRecentActivities() {
        List<RecentActivityResponse> activities = dashboardMapper.getRecentActivities();

        // 각 활동의 time 필드를 상대 시간으로 계산
        return activities.stream()
                .map(activity -> {
                    String relativeTime = calculateRelativeTime(activity.getRegDate());
                    activity.setTime(relativeTime);
                    return activity;
                })
                .collect(Collectors.toList());
    }

    /**
     * 날짜 문자열을 상대 시간으로 변환 ("5분 전", "1시간 전" 등)
     */
    private String calculateRelativeTime(String regDateStr) {
        if (regDateStr == null || regDateStr.isEmpty()) {
            return "알 수 없음";
        }

        // 안전한 fallback 미리 계산
        String safeFallback = regDateStr.length() >= 10 ? regDateStr.substring(0, 10) : regDateStr;

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime regDate = LocalDateTime.parse(regDateStr, formatter);
            LocalDateTime now = LocalDateTime.now();

            long minutes = ChronoUnit.MINUTES.between(regDate, now);
            long hours = ChronoUnit.HOURS.between(regDate, now);
            long days = ChronoUnit.DAYS.between(regDate, now);

            if (minutes < 1) {
                return "방금 전";
            } else if (minutes < 60) {
                return minutes + "분 전";
            } else if (hours < 24) {
                return hours + "시간 전";
            } else if (days < 7) {
                return days + "일 전";
            } else {
                // 7일 이상이면 날짜 표시
                return safeFallback;
            }
        } catch (Exception e) {
            // 파싱 실패 시 원본 날짜 반환
            return safeFallback;
        }
    }
}

package com.company.erp.po.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import java.util.Set;

@Getter
@RequiredArgsConstructor
public enum PoStatusCode {
    SAVED("T", Set.of("D")), // 임시저장 → 확정
    CONFIRMED("D", Set.of("A", "T")), // 확정 → 승인 또는 반려 (T로 복귀)
    APPROVED("A", Set.of("S")), // 승인 → 발주전송
    SENT("S", Set.of("C")), // 발주전송 → 완료 (입고완료 시 자동)
    COMPLETED("C", Set.of("E")), // 완료 → 종결
    CLOSED("E", Set.of()); // 종결 → 전이 불가

    private final String code;
    private final Set<String> allowedNextStatuses;

    // 코드로 Enum 찾기
    public static PoStatusCode fromCode(String code) {
        for (PoStatusCode status : values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("알 수 없는 상태 코드: " + code);
    }

    // 다음 상태로 전이 가능한지 검증
    public boolean canTransitionTo(String nextStatusCode) {
        return allowedNextStatuses.contains(nextStatusCode);
    }
}
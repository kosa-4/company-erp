package com.company.erp.po.enums;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import java.util.Set;
@Getter
@RequiredArgsConstructor
public enum PoStatusCode {
    SAVED("T", Set.of("D")),           // 저장 → 확정만 가능
    CONFIRMED("D", Set.of("A", "R")),  // 확정 → 승인 또는 반려
    REJECTED("R", Set.of("T")),        // 반려 → 저장으로 돌아감
    APPROVED("A", Set.of("S")),        // 승인 → 전송
    SENT("S", Set.of("C")),            // 전송 → 완료 (협력사 처리)
    DELIVERED("C", Set.of("E")),       // 완료 → 종결
    CLOSED("E", Set.of());             // 종결 → 전이 불가

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
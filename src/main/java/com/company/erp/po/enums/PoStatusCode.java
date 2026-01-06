package com.company.erp.po.enums;

import java.util.Arrays;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PoStatusCode {
    SAVED("T", "저장"),
    CONFIRMED("D", "확정"),
    APPROVED("A", "승인"),
    SENT("S", "발주전송"),
    DELIVERED("C", "납품완료"),
    CLOSED("E", "종결");

    private final String code;
    private final String displayName;

    public static String toDisplayName(String code) {
        return Arrays.stream(values())
            .filter(e -> e.getCode().equals(code))
            .findFirst()
            .map(PoStatusCode::getDisplayName)
            .orElse(code);
    }

    public static String toCode(String displayName) {
        return Arrays.stream(values())
            .filter(e -> e.getDisplayName().equals(displayName))
            .findFirst()
            .map(PoStatusCode::getCode)
            .orElse(displayName);
    }
}
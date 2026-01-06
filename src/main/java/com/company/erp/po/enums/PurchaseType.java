package com.company.erp.po.enums;

import java.util.Arrays;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PurchaseType {
    GENERAL("G", "일반"),
    CONTRACT("C", "단가계약"),
    URGENT("E", "긴급구매");

    private final String code;
    private final String displayName;

    public static String toDisplayName(String code) {
        return Arrays.stream(values())
            .filter(e -> e.getCode().equals(code))
            .findFirst()
            .map(PurchaseType::getDisplayName)
            .orElse(code);
    }

    public static String toCode(String displayName) {
        return Arrays.stream(values())
            .filter(e -> e.getDisplayName().equals(displayName))
            .findFirst()
            .map(PurchaseType::getCode)
            .orElse(displayName);
    }
}
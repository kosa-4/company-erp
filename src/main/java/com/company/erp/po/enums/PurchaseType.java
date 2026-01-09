package com.company.erp.po.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PurchaseType {
    GENERAL("G"),
    CONTRACT("C"),
    URGENT("E");

    private final String code;
}
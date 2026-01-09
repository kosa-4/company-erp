package com.company.erp.po.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PoStatusCode {
    SAVED("T"),
    CONFIRMED("D"),
    REJECTED("R"),
    APPROVED("A"),
    SENT("S"),
    DELIVERED("C"),
    CLOSED("E");

    private final String code;
}
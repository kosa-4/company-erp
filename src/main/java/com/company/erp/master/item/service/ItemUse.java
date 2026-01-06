package com.company.erp.master.item.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ItemUse {
    YES("Y", "사용 가능"),
    NO("N", "사용 불가");
    private final String value;
    private final String label;
}

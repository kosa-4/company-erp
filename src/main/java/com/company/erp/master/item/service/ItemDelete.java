package com.company.erp.master.item.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ItemDelete {
    YES("Y","삭제"),
    NO("N","사용중");
    private final String value;
    private final String label;
}

package com.company.erp.master.item.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ItemStatus {
    REGISTERED("R", "등록"),
    ALLOWED("A", "승인");
    private final String value;
    private final String label;
}

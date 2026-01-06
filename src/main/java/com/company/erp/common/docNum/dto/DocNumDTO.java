package com.company.erp.common.docNum.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DocNumDTO {
    private final String docType;
    private final String docNo;
    private final int seqNo;
    private final String dateKey; // "yymmdd" or "yyyy" or ""
}

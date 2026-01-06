package com.company.erp.common.docNum.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum DocKey {
    // 문서
    NT(ResetUnit.DAILY, "NT", "yyMMdd", "", 4, "NT2601050001"),
    PR(ResetUnit.DAILY, "PR", "yyMMdd", "", 4, "PR2601050001"),
    PO(ResetUnit.DAILY, "PO", "yyMMdd", "", 4, "PO2601050001"),
    GR(ResetUnit.DAILY, "GR", "yyMMdd", "", 4, "GR2601050001"),

    // 품목
    IT(ResetUnit.YEARLY, "IT", "yyyy", "IT-", 6, "IT-2026-000012"),

    // 협력사코드
    VN(ResetUnit.NONE, "VN", null, "V", 3, "V001");

    public final ResetUnit resetUnit;
    public final String docType;      // DB doc_num.doc_type에 들어갈 값
    public final String datePattern;  // 포맷에 쓰는 날짜 패턴 (없으면 null)
    public final String prefix;       // 접두어 (예: ITM-, S)
    public final int seqPad;
    public final String example;

}
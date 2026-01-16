package com.company.erp.pr.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

//구매요청현황 목록 조회용 DTO (헤더 정보만)
@Data
public class PrListResponse {
    private String prNum;          // PR번호
    private String prSubject;      // 구매요청명
    private String progressCd;     // 진행상태 (CODE_NAME)
    private String pcType;         // 구매유형 (CODE_NAME)
    private String requester;      // 요청자명
    private String deptName;       // 부서명
    private Date regDate;          // 등록일
    private BigDecimal prAmt;      // 총 금액
    private String rmk;            // 비고
}

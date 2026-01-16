package com.company.erp.pr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

//저장용 hd DTO
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrHdDTO {
    private String prNum;//구매요청번호
    private String regUserId;//등록자id
    private String prSubject;//구매요청명
    private String delFlag;//삭제여부
    private String deptCd;//구매요청부서
    private BigDecimal prAmt;//구매요청 총 금액
    private String rmk;//비고
    private String pcType;//구매유형

}

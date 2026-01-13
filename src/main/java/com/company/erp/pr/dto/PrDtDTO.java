package com.company.erp.pr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

//저장용 Dt DTO
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrDtDTO {
    private String prNum;//구매요청번호
    private String regUserId;//등록자id
    private String delFlag;//삭제여부
    private String itemCd;//품목코드
    private String itemDesc;//품목명
    private String itemSpec;//규격
    private String unitCd;//단위
    private BigDecimal prQt;//수량
    private BigDecimal unitPrc;//단가
    private BigDecimal prAmt;//금액
    private Date delyDate;//희망납기일
    private String rmk;//비고
}

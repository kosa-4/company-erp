package com.company.erp.pr.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

//품목 선택 팝업 및 품목정보 데이터 처리
@Data
public class PrItemDTO {
    private String itemCd;//품목코드
    private String itemNm;//품목명
    private String itemSpec;//규격
    private String unitCd;//단위

    //품목정보에서 사용할 데이터
    private BigDecimal prQt;//수량
    private BigDecimal unitPrc;//단가
    private BigDecimal prAmt;//금액
    private Date delyDate;//희망납기일
    private String rmk;//비고
}

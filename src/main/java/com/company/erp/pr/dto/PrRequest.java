package com.company.erp.pr.dto;

import lombok.Data;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

//구매요청 DTO
@Getter
public class PrRequest {
    private PrHd prHd;
    private List<PrDt> prDtList;

    @Data
    public static class PrHd{
        private String prSubject;//구매요청명
        private String pcType;//구매유형(codd에서 가져오기)
        private String regUser;//등록자
        private String deptName;//부서명
        private String rmk;//비고
    }

    @Data
    public static class PrDt{
        private String itemCode;//품목코드
        private BigDecimal prQt;//수량
        private BigDecimal unitPrc;//단가
        private Date delyDate;//희망납기일
    }

}
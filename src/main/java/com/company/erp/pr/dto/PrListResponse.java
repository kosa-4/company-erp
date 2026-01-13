package com.company.erp.pr.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

//구매요청현황 리스트 반환을 위한 response dto
@Data
public class PrListResponse {
    private String progressCd;//상태
    private String prNum;//pr번호
    private String pcType;//구매유형
    private String reqUserId;//요청자(userNm과 동일로 우선 판단)
    private String deptNm;//부서명
    private Date regDate;//요청일(regDate 등록일과 동일)

    //prdt에서 가져올 데이터
    private String itemCd;//품목코드
    private String itemDesc;//품목명
    private BigDecimal prQt;//수량
    private BigDecimal unitPrc;//단가
    private BigDecimal prAmt;//금액
    private Date delyDate;//희망납기일
}

package com.company.erp.rfq.buyer.result.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RfqResultItem {
    private String itemCd; // 품목코드
    private String itemNm; // 품목명
    private String spec; // 규격
    private String unit; // 단위
    private BigDecimal qty; // 수량
    private String unitPrice; // 견적단가
    private String amt; // 견적금액
    private String dlvyDate; // 납기가능일
    private String rmk; // 비고
}

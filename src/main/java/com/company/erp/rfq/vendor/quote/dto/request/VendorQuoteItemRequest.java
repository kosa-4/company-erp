package com.company.erp.rfq.vendor.quote.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 협력사 견적 품목 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorQuoteItemRequest {

    @NotNull(message = "라인번호는 필수입니다")
    private Integer lineNo;

    @NotNull(message = "견적단가는 필수입니다")
    private BigDecimal quoteUnitPrc;

    @NotNull(message = "견적수량은 필수입니다")
    private BigDecimal quoteQt;

    private BigDecimal quoteAmt; // 견적금액 (자동 계산)

    private LocalDate delyDate; // 납기가능일

    private String rmk; // 비고
}

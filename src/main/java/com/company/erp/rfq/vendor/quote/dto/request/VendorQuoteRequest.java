package com.company.erp.rfq.vendor.quote.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 협력사 견적 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorQuoteRequest {

    @NotEmpty(message = "견적 품목은 최소 1개 이상이어야 합니다")
    @Valid
    private List<VendorQuoteItemRequest> items;
}

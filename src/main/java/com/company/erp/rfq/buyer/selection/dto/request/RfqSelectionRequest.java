package com.company.erp.rfq.buyer.selection.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 업체 선정 요청 DTO (Selection 패키지 전용)
 */
@Getter
@Setter
public class RfqSelectionRequest {
    private String rfqNum; // 견적번호

    @NotBlank(message = "협력사 코드는 필수입니다.")
    private String vendorCd; // 선정된 협력사코드

    private String selectRmk; // 선정 사유
}

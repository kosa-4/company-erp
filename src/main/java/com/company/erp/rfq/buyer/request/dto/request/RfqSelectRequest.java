package com.company.erp.rfq.buyer.request.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 업체 선정 요청 DTO
 * 개찰(G) 상태에서 최종 업체를 선정할 때 사용합니다.
 */
@Getter
@Setter
public class RfqSelectRequest {
    private String rfqNum; // 견적번호

    @NotBlank(message = "협력사 코드는 필수입니다.")
    private String vendorCd; // 선정된 협력사코드

    private String selectRmk; // 선정 사유
}

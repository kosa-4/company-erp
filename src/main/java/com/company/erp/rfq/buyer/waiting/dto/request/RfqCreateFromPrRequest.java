package com.company.erp.rfq.buyer.waiting.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * PR 기반 RFQ 초안 생성 요청
 * - prNum만 받음
 * - vendor/마감일/견적유형은 견적요청 화면에서 입력
 */
@Getter
@Setter
public class RfqCreateFromPrRequest {
    @NotBlank(message = "PR 번호는 필수입니다.")
    private String prNum;
}

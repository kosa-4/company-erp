package com.company.erp.rfq.workflow;

import org.springframework.stereotype.Component;

/**
 * RFQ 비즈니스 규칙 및 검증 (전체 라이프사이클 관리)
 * - Service와 같은 패키지에 두어 응집도 높임
 */
@Component
public class RfqPolicy {

    /**
     * PR 기반 RFQ 생성 가능 여부 검증
     * - PROGRESS_CD = 'A' (승인)
     * - PC_TYPE != 'C'(단가계약) && != 'E'(긴급구매)
     */
    public void validateCreatableFromPr(String prNum, String progressCd, String pcType) {
        if (!"A".equals(progressCd)) {
            throw new IllegalStateException(
                    "PR is not approved. prNum=" + prNum + ", progressCd=" + progressCd);
        }
        if ("C".equals(pcType) || "E".equals(pcType)) {
            throw new IllegalStateException(
                    "PR type excluded from RFQ. prNum=" + prNum + ", pcType=" + pcType);
        }
    }
}

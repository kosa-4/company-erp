package com.company.erp.rfq.workflow;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.rfq.buyer.waiting.dto.response.PrLockRow;
import com.company.erp.rfq.buyer.waiting.mapper.RfqBuyerWaitingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * RFQ 워크플로우 관리
 */
@Service
@RequiredArgsConstructor
public class RfqWorkflowService {

    private final RfqBuyerWaitingMapper mapper;
    private final DocNumService docNumService;
    private final RfqPolicy rfqPolicy;

    /**
     * 필수 텍스트 검증 (단순 Null 체크는 Service 내부 유지)
     */
    private void requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + "은 필수입니다.");
        }
    }
}

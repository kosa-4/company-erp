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
     * PR 기반 RFQ 초안 생성
     * - RFQHD(T) + RFQDT 복사만
     * - RFQVN 생성 안 함 (전송 시점에 생성)
     */
    @Transactional
    public String createRfqDraftFromPr(String prNum, String userId) {
        requireText(prNum, "prNum");
        requireText(userId, "userId");

        // 1. PRHD FOR UPDATE (행 잠금)
        PrLockRow pr = mapper.selectPrForUpdate(prNum);
        if (pr == null) {
            throw new IllegalArgumentException("구매요청이 없습니다. prNum = " + prNum);
        }

        // 2. 승인 상태 + 구매유형 검증 (Policy 위임)
        rfqPolicy.validateCreatableFromPr(prNum, pr.getProgressCd(), pr.getPcType());

        // 3. RFQHD 중복 생성 방지 (NOT EXISTS 재검증)
        int existingCount = mapper.countRfqByPrNum(prNum);
        if (existingCount > 0) {
            throw new IllegalStateException("해당 구매요청에 대한 견적이 있습니다 : " + prNum);
        }

        // 4. RFQ 번호 채번
        String rfqNum = docNumService.generateDocNumStr(DocKey.RQ);

        // 5. RFQHD INSERT (T: 임시저장)
        int insertedHd = mapper.insertRfqHdFromPr(rfqNum, prNum, userId);
        if (insertedHd != 1) {
            throw new IllegalStateException("RFQHD에 insert 실패. prNum = " + prNum);
        }

        // 6. RFQDT INSERT (PRDT 복사)
        int insertedDt = mapper.insertRfqDtFromPr(rfqNum, prNum, userId);
        if (insertedDt == 0) {
            throw new IllegalStateException("RFQDT에 insert 실패. prNum = " + prNum);
        }

        return rfqNum;
    }

    /**
     * 필수 텍스트 검증 (단순 Null 체크는 Service 내부 유지)
     */
    private void requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + "은 필수입니다.");
        }
    }
}

package com.company.erp.rfq.buyer.selection.service;

import com.company.erp.rfq.buyer.selection.dto.request.RfqSelectionRequest;
import com.company.erp.rfq.buyer.selection.dto.response.RfqSelectionResponse;
import com.company.erp.rfq.buyer.selection.mapper.RfqSelectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 협력업체 선정(구매사) 서비스
 */
@Service
@RequiredArgsConstructor
public class RfqSelectionService {

    private final RfqSelectionMapper mapper;

    /**
     * 선정 대상 조회 (M, G, J 상태)
     */
    @Transactional(readOnly = true)
    public List<RfqSelectionResponse> getSelectionList(Map<String, Object> params) {
        return mapper.selectRfqSelectionList(params);
    }

    /**
     * 견적 개찰 (M -> G)
     */
    @Transactional
    public void openRfq(String rfqNum, String userId) {
        int updated = mapper.updateRfqStatusToOpened(rfqNum, userId);
        if (updated != 1) {
            throw new IllegalStateException("개찰 가능한 상태(마감)가 아니거나 권한이 없습니다.");
        }
    }

    /**
     * 업체 선정
     */
    @Transactional
    public void selectVendor(RfqSelectionRequest request, String userId) {
        String rfqNum = request.getRfqNum();
        String vendorCd = request.getVendorCd();

        // 1. Header 상태 전환 (G -> J)
        int hdUpdated = mapper.updateRfqStatusToSelected(rfqNum, userId);
        if (hdUpdated != 1) {
            throw new IllegalStateException("선정 권한이 없거나 개찰(G) 상태가 아닙니다.");
        }

        // 2. Vendor 선정 상태 초기화 및 대상 선정 (사유 포함)
        mapper.resetRfqVendorsSelection(rfqNum);
        int vnUpdated = mapper.updateRfqVendorSelection(rfqNum, vendorCd, request.getSelectRmk(), userId);
        if (vnUpdated != 1) {
            throw new IllegalStateException("선정된 협력사 정보 업데이트에 실패했습니다.");
        }

        // 3. 선정된 협력사의 품목 SELECT_YN 업데이트 (발주대기 목록 조회용)
        int itemUpdated = mapper.updateRfqVendorItemSelection(rfqNum, vendorCd, userId);
        if (itemUpdated < 1) {
            throw new IllegalStateException("선정된 협력사의 품목 정보가 존재하지 않습니다.");
        }
    }
}

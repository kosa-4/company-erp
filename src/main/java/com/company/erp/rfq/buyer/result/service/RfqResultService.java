package com.company.erp.rfq.buyer.result.service;

import com.company.erp.rfq.buyer.result.dto.response.RfqResultItem;
import com.company.erp.rfq.buyer.result.dto.response.RfqSelectionResultDetailResponse;
import com.company.erp.rfq.buyer.result.dto.response.RfqSelectionResultResponse;
import com.company.erp.rfq.buyer.result.mapper.RfqResultMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RfqResultService {

    private final RfqResultMapper mapper;

    /**
     * 선정 결과 목록 조회
     */
    public List<RfqSelectionResultResponse> getRfqResultList(Map<String, Object> params) {
        return mapper.selectRfqResultList(params);
    }

    /**
     * 선정 결과 상세 조회
     */
    public RfqSelectionResultDetailResponse getRfqResultDetail(String rfqNum) {
        RfqSelectionResultDetailResponse response = new RfqSelectionResultDetailResponse();

        // 헤더 정보 조회
        RfqSelectionResultResponse header = mapper.selectRfqResultHeader(rfqNum);
        if (header == null) {
            throw new IllegalArgumentException("해당 견적 결과가 존재하지 않거나 선정되지 않았습니다.");
        }

        // 품목 정보 조회
        List<RfqResultItem> items = mapper.selectRfqResultItems(rfqNum);

        response.setHeader(header);
        response.setItems(items);

        return response;
    }
}

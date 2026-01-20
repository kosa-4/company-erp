package com.company.erp.rfq.buyer.result.service;

import com.company.erp.common.util.AesCryptoUtil;
import com.company.erp.rfq.buyer.result.dto.response.RfqResultItem;
import com.company.erp.rfq.buyer.result.dto.response.RfqSelectionResultDetailResponse;
import com.company.erp.rfq.buyer.result.dto.response.RfqSelectionResultResponse;
import com.company.erp.rfq.buyer.result.mapper.RfqResultMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RfqResultService {

    private final RfqResultMapper mapper;

    @Value("${app.crypto.key}")
    private String cryptoKey;

    /**
     * 선정 결과 목록 조회
     */
    public List<RfqSelectionResultResponse> getRfqResultList(Map<String, Object> params) {
        List<RfqSelectionResultResponse> list = mapper.selectRfqResultList(params);
        for (RfqSelectionResultResponse res : list) {
            res.setTotalAmt(AesCryptoUtil.decrypt(res.getTotalAmt(), cryptoKey));
        }
        return list;
    }

    /**
     * 선정 결과 상세 조회
     */
    public RfqSelectionResultDetailResponse getRfqResultDetail(String rfqNum) {
        RfqSelectionResultDetailResponse response = new RfqSelectionResultDetailResponse();

        // 헤더 정보 조회
        RfqSelectionResultResponse header = mapper.selectRfqResultHeader(rfqNum);
        if (header == null) {
            throw new NoSuchElementException("해당 견적 결과가 존재하지 않거나 선정되지 않았습니다.");
        }
        header.setTotalAmt(AesCryptoUtil.decrypt(header.getTotalAmt(), cryptoKey));

        // 품목 정보 조회
        List<RfqResultItem> items = mapper.selectRfqResultItems(rfqNum);
        for (RfqResultItem item : items) {
            item.setUnitPrice(AesCryptoUtil.decrypt(item.getUnitPrice(), cryptoKey));
            item.setAmt(AesCryptoUtil.decrypt(item.getAmt(), cryptoKey));
        }

        response.setHeader(header);
        response.setItems(items);

        return response;
    }
}

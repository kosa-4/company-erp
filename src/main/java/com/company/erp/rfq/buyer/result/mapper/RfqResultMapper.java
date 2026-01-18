package com.company.erp.rfq.buyer.result.mapper;

import com.company.erp.rfq.buyer.result.dto.response.RfqResultItem;
import com.company.erp.rfq.buyer.result.dto.response.RfqSelectionResultResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface RfqResultMapper {
    /**
     * 선정 완료된 RFQ 목록 조회
     */
    List<RfqSelectionResultResponse> selectRfqResultList(Map<String, Object> params);

    /**
     * 특정 RFQ의 선정 결과 헤더 조회
     */
    RfqSelectionResultResponse selectRfqResultHeader(@Param("rfqNum") String rfqNum);

    /**
     * 선정된 업체의 견적 상세 품목 조회
     */
    List<RfqResultItem> selectRfqResultItems(@Param("rfqNum") String rfqNum);
}

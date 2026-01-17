package com.company.erp.rfq.buyer.waiting.mapper;

import com.company.erp.rfq.buyer.waiting.dto.request.RfqWaitingSearchRequest;
import com.company.erp.rfq.buyer.waiting.dto.response.PrHeaderRow;
import com.company.erp.rfq.buyer.waiting.dto.response.PrItemRow;
import com.company.erp.rfq.buyer.waiting.dto.response.PrLockRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RfqBuyerWaitingMapper {

        /**
         * PR 헤더 목록 조회 (집계 정보 포함)
         */
        List<PrHeaderRow> selectPrHeaders(RfqWaitingSearchRequest request);

        /**
         * PR 품목 목록 조회
         */
        List<PrItemRow> selectPrItems(@Param("prNums") List<String> prNums);

}

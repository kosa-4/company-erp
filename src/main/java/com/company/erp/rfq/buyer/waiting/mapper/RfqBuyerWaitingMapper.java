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

    /**
     * PRHD FOR UPDATE + 검증
     */
    PrLockRow selectPrForUpdate(@Param("prNum") String prNum);

    /**
     * RFQHD 존재 여부 체크
     */
    int countRfqByPrNum(@Param("prNum") String prNum);

    /**
     * RFQHD INSERT (PR 기반)
     */
    int insertRfqHdFromPr(@Param("rfqNum") String rfqNum,
            @Param("prNum") String prNum,
            @Param("userId") String userId);

    /**
     * RFQDT INSERT (PRDT 복사)
     */
    int insertRfqDtFromPr(@Param("rfqNum") String rfqNum,
            @Param("prNum") String prNum,
            @Param("userId") String userId);
}

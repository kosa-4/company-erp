package com.company.erp.rfq.vendor.quote.mapper;

import com.company.erp.rfq.vendor.quote.dto.request.VendorQuoteItemRequest;
import com.company.erp.rfq.vendor.quote.dto.response.VendorQuoteResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 협력사 견적서 작성 Mapper
 */
@Mapper
public interface RfqVendorQuoteMapper {

        /**
         * 견적 헤더 정보 조회
         */
        VendorQuoteResponse selectQuoteHeader(
                        @Param("rfqNum") String rfqNum,
                        @Param("vendorCd") String vendorCd);

        /**
         * 견적 품목 목록 조회 (RFQDT + RFQVNDT 조인)
         */
        List<VendorQuoteResponse.QuoteItemInfo> selectQuoteItems(
                        @Param("rfqNum") String rfqNum,
                        @Param("vendorCd") String vendorCd);

        /**
         * RFQVNDT 존재 여부 확인
         */
        int countRfqVndt(
                        @Param("rfqNum") String rfqNum,
                        @Param("vendorCd") String vendorCd);

        /**
         * RFQDT에서 RFQVNDT로 초기 복사
         */
        int insertRfqVndtFromRfqdt(
                        @Param("rfqNum") String rfqNum,
                        @Param("vendorCd") String vendorCd,
                        @Param("userId") String userId);

        /**
         * RFQVNDT 품목 업데이트 (암호화된 단가/금액 저장)
         */
        int updateRfqVndtItem(
                        @Param("rfqNum") String rfqNum,
                        @Param("vendorCd") String vendorCd,
                        @Param("lineNo") Integer lineNo,
                        @Param("quoteUnitPrc") String quoteUnitPrc,
                        @Param("quoteQt") BigDecimal quoteQt,
                        @Param("quoteAmt") String quoteAmt,
                        @Param("delyDate") java.time.LocalDate delyDate,
                        @Param("rmk") String rmk,
                        @Param("userId") String userId);

        /**
         * RFQVN 상태 및 총액 업데이트
         */
        int updateRfqVnStatusAndAmount(
                        @Param("rfqNum") String rfqNum,
                        @Param("vendorCd") String vendorCd,
                        @Param("progressCd") String progressCd,
                        @Param("totalAmt") String totalAmt,
                        @Param("userId") String userId);

        /**
         * RFQVN 상태 조회
         */
        Map<String, Object> selectRfqVnStatus(
                        @Param("rfqNum") String rfqNum,
                        @Param("vendorCd") String vendorCd);

        /**
         * RFQHD 상태 조회
         */
        String selectRfqHdStatus(@Param("rfqNum") String rfqNum);
}

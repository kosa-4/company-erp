package com.company.erp.rfq.buyer.selection.mapper;

import com.company.erp.rfq.buyer.selection.dto.response.RfqCompareResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RfqCompareMapper {

    RfqCompareResponse selectHeader(@Param("rfqNo") String rfqNo);

    List<RfqCompareResponse.Item> selectItems(@Param("rfqNo") String rfqNo);

    List<RfqCompareResponse.Vendor> selectVendors(@Param("rfqNo") String rfqNo);

    List<RfqCompareResponse.RfqCompareQuoteRow> selectQuoteRows(@Param("rfqNo") String rfqNo);
}
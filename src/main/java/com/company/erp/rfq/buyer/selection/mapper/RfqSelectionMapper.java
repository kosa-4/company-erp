package com.company.erp.rfq.buyer.selection.mapper;

import com.company.erp.rfq.buyer.selection.dto.response.RfqSelectionResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface RfqSelectionMapper {

    /**
     * 선정 대상 견적 목록 조회 (M, G, J 상태)
     */
    List<RfqSelectionResponse> selectRfqSelectionList(Map<String, Object> params);

    /**
     * 개찰: Header 상태 전환 (M -> G)
     */
    int updateRfqStatusToOpened(@Param("rfqNum") String rfqNum, @Param("loginUserId") String loginUserId);

    /**
     * 선정: Header 상태 전환 (G -> J)
     */
    int updateRfqStatusToSelected(@Param("rfqNum") String rfqNum, @Param("loginUserId") String loginUserId);

    /**
     * 선정: Vendors 선정 상태 초기화
     */
    int resetRfqVendorsSelection(@Param("rfqNum") String rfqNum);

    /**
     * 선정: 대상 Vendor 선정 (Y) 및 상태 업데이트(J)
     */
    int updateRfqVendorSelection(@Param("rfqNum") String rfqNum,
            @Param("vendorCd") String vendorCd,
            @Param("selectRmk") String selectRmk,
            @Param("loginUserId") String loginUserId);

    /**
     * 선정: 대상 Vendor의 품목 선정 (RFQVNDT.SELECT_YN = Y)
     */
    int updateRfqVendorItemSelection(@Param("rfqNum") String rfqNum,
            @Param("vendorCd") String vendorCd,
            @Param("loginUserId") String loginUserId);
}

package com.company.erp.rfq.vendor.management.mapper;

import com.company.erp.rfq.vendor.management.dto.request.VendorRfqSearchRequest;
import com.company.erp.rfq.vendor.management.dto.response.VendorRfqDetailResponse;
import com.company.erp.rfq.vendor.management.dto.response.VendorRfqListResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 협력사 견적관리 Mapper
 */
@Mapper
public interface RfqVendorManagementMapper {

    /**
     * 협력사별 RFQ 목록 조회
     */
    List<VendorRfqListResponse> selectVendorRfqList(
            @Param("vendorCd") String vendorCd,
            @Param("search") VendorRfqSearchRequest search);

    /**
     * 협력사별 RFQ 상세 조회 (헤더)
     */
    VendorRfqDetailResponse selectVendorRfqDetail(
            @Param("rfqNum") String rfqNum,
            @Param("vendorCd") String vendorCd);

    /**
     * 협력사별 RFQ 상세 조회 (품목 목록)
     */
    List<VendorRfqDetailResponse.RfqItemInfo> selectVendorRfqItems(
            @Param("rfqNum") String rfqNum);

    /**
     * RFQVN 상태 조회
     */
    Map<String, Object> selectRfqVnStatus(
            @Param("rfqNum") String rfqNum,
            @Param("vendorCd") String vendorCd);

    /**
     * RFQVN 상태 업데이트
     */
    int updateRfqVnStatus(
            @Param("rfqNum") String rfqNum,
            @Param("vendorCd") String vendorCd,
            @Param("progressCd") String progressCd,
            @Param("userId") String userId);

    /**
     * RFQHD 상태 조회
     */
    String selectRfqHdStatus(@Param("rfqNum") String rfqNum);
}

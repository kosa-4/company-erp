package com.company.erp.rfq.buyer.progress.mapper;

import com.company.erp.rfq.buyer.progress.dto.request.RfqProgressSearchRequest;
import com.company.erp.rfq.buyer.progress.dto.response.RfqProgressGroupResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RfqProgressMapper {

        /**
         * 견적 진행 현황 목록 조회 (그룹화)
         */
        List<RfqProgressGroupResponse> selectRfqProgressList(@Param("req") RfqProgressSearchRequest request);

        /**
         * RFQ 헤더 상태 업데이트 (전송, 마감 등)
         */
        int updateRfqStatus(@Param("rfqNum") String rfqNum, @Param("statusCd") String statusCd,
                        @Param("loginUserId") String loginUserId);

        /**
         * RFQ 협력사 상태 전체 업데이트
         */
        int updateAllVendorStatus(@Param("rfqNum") String rfqNum, @Param("statusCd") String statusCd,
                        @Param("loginUserId") String loginUserId);

        /**
         * 특정 RFQ의 현재 협력사 코드 목록 조회 (전송 전 검증용)
         */
        List<String> selectRfqVendorCodes(@Param("rfqNum") String rfqNum);
}

package com.company.erp.rfq.buyer.request.mapper;

import com.company.erp.rfq.buyer.request.dto.request.RfqSaveRequest;
import com.company.erp.rfq.buyer.request.dto.response.RfqDetailResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface RfqBuyerRequestMapper {

        // --- 조회 (Read) ---
        RfqDetailResponse.Header selectRfqHeader(@Param("rfqNum") String rfqNum);

        List<RfqDetailResponse.Item> selectRfqItems(@Param("rfqNum") String rfqNum);

        List<RfqDetailResponse.Vendor> selectRfqVendors(@Param("rfqNum") String rfqNum);

        // [복구] 기존 견적대기목록 등과 일관성을 위해 Map 방식으로 유지
        List<Map<String, Object>> selectCodeNames(@Param("codeGroup") String codeGroup);

        // [보완] 원본 PR 필수 품목 라인번호 조회 (검증용)
        List<Integer> selectPrItemLineNos(@Param("prNum") String prNum);

        // [신규] PR 기반 초기화 데이터 조회
        RfqDetailResponse.Header selectRfqInitHeader(@Param("prNum") String prNum);

        List<RfqDetailResponse.Item> selectRfqInitItems(@Param("prNum") String prNum);

        // --- 저장 및 수정 (Save/Update) ---
        int insertRfqHeader(@Param("req") RfqSaveRequest request, @Param("prNum") String prNum,
                        @Param("pcType") String pcType, @Param("loginUserId") String loginUserId);

        // [보완] DTO 오염 방지를 위해 loginUserId를 별도 파라미터로 분리
        int updateRfqHeader(@Param("req") RfqSaveRequest request, @Param("loginUserId") String loginUserId);

        // RFQDT 동기화 (물리 삭제 후 DTO 기반 재삽입)
        int deleteRfqItems(@Param("rfqNum") String rfqNum);

        int insertRfqItems(@Param("rfqNum") String rfqNum, @Param("items") List<RfqSaveRequest.RfqItemDTO> items,
                        @Param("loginUserId") String loginUserId);

        int insertRfqVendors(@Param("rfqNum") String rfqNum, @Param("vendorCodes") List<String> vendorCodes,
                        @Param("loginUserId") String loginUserId);

        // --- 전송 (Send) ---
        // (1) HD 상태 전환 (T -> RFQS) + Owner 체크
        int updateRfqStatusToSend(@Param("rfqNum") String rfqNum, @Param("loginUserId") String loginUserId);

        // (2) VN 최초 생성 (Batch Insert)
        int deleteRfqVendors(@Param("rfqNum") String rfqNum);

        int insertRfqVendorsOnSend(@Param("rfqNum") String rfqNum, @Param("vendorCodes") List<String> vendorCodes,
                        @Param("loginUserId") String loginUserId);

        // --- 선정 (Select) ---
        // (1) HD 상태 전환 (G -> J) + Owner 체크
        int updateRfqStatusToSelected(@Param("rfqNum") String rfqNum, @Param("loginUserId") String loginUserId);

        // (2) Vendor 선정 상태 초기화
        int resetRfqVendorsSelection(@Param("rfqNum") String rfqNum);

        // (3) 대상 Vendor 선정 (Y)
        int updateRfqVendorSelection(@Param("rfqNum") String rfqNum, @Param("vendorCd") String vendorCd,
                        @Param("loginUserId") String loginUserId);
}

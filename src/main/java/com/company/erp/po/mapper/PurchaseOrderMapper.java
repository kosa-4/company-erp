package com.company.erp.po.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.company.erp.po.dto.PurchaseOrderDTO;
import com.company.erp.po.dto.PurchaseOrderItemDTO;
import com.company.erp.rfq.dto.RfqSelectedDTO;
import com.company.erp.rfq.dto.RfqSelectedItemDTO;

@Mapper
public interface PurchaseOrderMapper {

        List<PurchaseOrderDTO> selectList(Map<String, Object> params);

        // 협력사 전용: 본인 발주 목록 조회
        List<PurchaseOrderDTO> selectVendorOrderList(Map<String, Object> params);

        PurchaseOrderDTO selectHeader(String poNo);

        List<PurchaseOrderItemDTO> selectItems(String poNo);

        // 등록 시 regUserId, ctrlDeptCd 별도 전달 (DTO에 포함되지 않음)
        int insertHeader(@Param("dto") PurchaseOrderDTO dto,
                        @Param("regUserId") String regUserId,
                        @Param("ctrlDeptCd") String ctrlDeptCd);

        // 등록 시 regUserId 별도 전달
        int insertItem(@Param("item") PurchaseOrderItemDTO item,
                        @Param("regUserId") String regUserId);

        // 수정 시 modUserId 별도 전달 (DTO에 포함되지 않음)
        int updateHeader(@Param("dto") PurchaseOrderDTO dto,
                        @Param("modUserId") String modUserId);

        int deleteHeader(String poNo);

        int deleteItems(String poNo);

        int updateStatus(@Param("poNo") String poNo,
                        @Param("status") String status,
                        @Param("userId") String userId);

        // 반려 사유
        int updateStatusWithReason(@Param("poNo") String poNo,
                        @Param("status") String status,
                        @Param("rejectReason") String rejectReason,
                        @Param("userId") String userId);

        // 협력사 수신확인
        int updateVendorConfirm(@Param("poNo") String poNo,
                        @Param("userId") String userId);

        // ========== 발주대기 조회 (RFQ 선정완료) ==========
        // RFQ 선정완료 목록 조회
        List<RfqSelectedDTO> selectRfqSelectedList(Map<String, Object> params);

        // RFQ 선정완료 품목 조회
        List<RfqSelectedItemDTO> selectRfqSelectedItems(String rfqNo);

        // PR 품목을 RfqSelectedItemDTO로 조회 (긴급/단가계약용)
        List<RfqSelectedItemDTO> selectPrItemsAsRfqItems(String prNum);
}

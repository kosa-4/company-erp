package com.company.erp.inventory.mapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import com.company.erp.inventory.dto.GoodsReceiptDTO;
import com.company.erp.inventory.dto.GoodsReceiptItemDTO;
import com.company.erp.po.dto.PurchaseOrderDTO;

public interface GoodsReceiptMapper {

        // ========== 입고대상조회 ==========
        /**
         * 입고 가능한 PO 목록 조회
         * - POHD.PROGRESS_CD = 'S' (발주전송)
         * - 해당 PO가 입고완료(GRE) 상태가 아닌 것
         */
        List<PurchaseOrderDTO> selectPendingPOList(Map<String, Object> params);

        // ========== 입고현황 ==========
        /**
         * 입고 목록 조회 (검색조건 포함)
         */
        List<GoodsReceiptDTO> selectList(Map<String, Object> params);

        /**
         * 입고 헤더 단건 조회
         */
        GoodsReceiptDTO selectHeader(@Param("grNo") String grNo);

        /**
         * 입고 상세 품목 목록 조회
         */
        List<GoodsReceiptItemDTO> selectItems(@Param("grNo") String grNo);

        /**
         * 입고 헤더 등록
         */
        int insertHeader(@Param("dto") GoodsReceiptDTO dto,
                        @Param("regUserId") String regUserId,
                        @Param("ctrlDeptCd") String ctrlDeptCd);

        /**
         * 입고 상세 품목 등록
         */
        int insertItem(@Param("item") GoodsReceiptItemDTO item);

        // ========== 입고조정 ==========
        /**
         * 상세 품목 수정 (입고수량, 저장위치만)
         */
        int updateItem(@Param("item") GoodsReceiptItemDTO item,
                        @Param("modUserId") String modUserId);

        /**
         * 상세 품목 취소 처리
         */
        int cancelItem(@Param("grNo") String grNo,
                        @Param("itemCode") String itemCode,
                        @Param("cancelRemark") String cancelRemark,
                        @Param("modUserId") String modUserId);

        /**
         * 헤더 상태 업데이트
         */
        int updateHeaderStatus(@Param("grNo") String grNo,
                        @Param("status") String status,
                        @Param("modUserId") String modUserId);

        // ========== 상태 계산용 ==========
        /**
         * 특정 PO의 누적 입고수량 조회 (정상 상태만)
         */
        BigDecimal selectAccumulatedQty(@Param("poNo") String poNo);

        /**
         * 특정 PO의 발주수량 합계 조회
         */
        BigDecimal selectOrderQty(@Param("poNo") String poNo);

        /**
         * 특정 GR의 모든 DT가 취소 상태인지 확인
         */
        boolean isAllItemsCancelled(@Param("grNo") String grNo);

        /**
         * GR 번호로 PO 번호 조회 (상태 재계산 시 필요)
         */
        String selectPoNoByGrNo(@Param("grNo") String grNo);
}

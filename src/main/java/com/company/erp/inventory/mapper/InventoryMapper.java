package com.company.erp.inventory.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Param;

import com.company.erp.inventory.dto.GrDetailDTO;
import com.company.erp.inventory.dto.GrHeaderDTO;
import com.company.erp.inventory.dto.ReceivingTargetDTO;

public interface InventoryMapper {

    /**
     * 입고대상 조회
     * - 발주 전송 상태인 품목 중 미입고/부분입고 대상
     */
    List<ReceivingTargetDTO> selectReceivingTargets(Map<String, Object> params);

    /**
     * 입고 헤더 목록 조회
     * - CODD JOIN으로 코드명 조회
     */
    List<GrHeaderDTO> selectGrHeaderList(Map<String, Object> params);

    /**
     * 입고 헤더 상세 조회
     */
    GrHeaderDTO selectGrHeader(String grNo);

    /**
     * 입고 상세 목록 조회
     */
    List<GrDetailDTO> selectGrDetails(String grNo);

    /**
     * 입고 헤더 등록
     * 
     * @param dto       입고 헤더 DTO
     * @param regUserId 등록자ID
     */
    int insertGrHeader(@Param("dto") GrHeaderDTO dto, @Param("regUserId") String regUserId);

    /**
     * 입고 상세 등록
     * 
     * @param detail    입고 상세 DTO
     * @param regUserId 등록자ID
     */
    int insertGrDetail(@Param("detail") GrDetailDTO detail, @Param("regUserId") String regUserId);

    /**
     * 입고 헤더 수정
     */
    int updateGrHeader(@Param("dto") GrHeaderDTO dto, @Param("modUserId") String modUserId);

    /**
     * 입고 상세 수정
     */
    int updateGrDetail(@Param("detail") GrDetailDTO detail, @Param("modUserId") String modUserId);

    /**
     * 입고 상세 부분 수정 (입고조정용)
     * - 입고수량, 저장위치만 수정
     */
    int updateGrDetailPartial(@Param("detail") GrDetailDTO detail, @Param("modUserId") String modUserId);

    /**
     * 입고 취소 (상태 변경)
     */
    int cancelGr(@Param("grNo") String grNo, @Param("modUserId") String modUserId);

    /**
     * 입고 헤더 삭제 (논리 삭제)
     */
    int deleteGrHeader(String grNo);

    /**
     * 입고 상세 삭제 (논리 삭제)
     */
    int deleteGrDetails(String grNo);
}
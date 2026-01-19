package com.company.erp.pr.mapper;

import com.company.erp.pr.dto.*;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface PrMapper {
    String selectUserName(String userId);

    void insertPrHd(PrHdDTO prHdDTO);
    void insertPrDt(@Param("prDtList") List<PrDtDTO> prDtDTOList);

    List<PrItemDTO> selectPrItem(@Param("itemCode") String itemCode, @Param("itemName") String itemName);
    List<PrItemDTO> selectPrItemInfo(@Param("itemCdList") List<String> itemCodeList);

    PrHdDTO selectPrNum(@Param("prNum") String prNum);
    void deletePrHd(@Param("prNum") String prNum);
    void deletePrDt(@Param("prNum") String prNum);

    // 구매요청 현황 목록 조회 (헤더만)
    List<PrListResponse> selectPrList(@Param("prNum") String prNum,
                                      @Param("prSubject") String prSubject,
                                      @Param("requester") String requester,
                                      @Param("deptName") String deptName,
                                      @Param("progressCd") String progressCd,
                                      @Param("startDate") String startDate,
                                      @Param("endDate") String endDate);
    
    // 구매요청 상세 품목 목록 조회
    List<PrDtDTO> selectPrDetail(@Param("prNum") String prNum);


    int approvePr(@Param("userId") String userId, @Param("deptCd") String deptCd,
                              @Param("prNum") String prNum);

    void rejectPr(@Param("prNum") String prNum, @Param("userId") String userId, @Param("deptCd") String deptCd);

    // PROGRESS_CD의 CODE_NAME 조회 (승인 상태 확인용)
    String selectProgressCdName(@Param("progressCd") String progressCd);

    // 구매요청 헤더 수정 (구매요청명, 구매유형만)
    int updatePrHd(@Param("prNum") String prNum, 
                    @Param("prSubject") String prSubject,
                    @Param("pcType") String pcType,
                    @Param("modUserId") String modUserId);

}

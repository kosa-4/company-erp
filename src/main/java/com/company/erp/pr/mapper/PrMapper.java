package com.company.erp.pr.mapper;

import com.company.erp.pr.dto.*;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface PrMapper {
    String selectUserName(String userId);

    void insertPrHd(PrHdDTO prHdDTO);
    void insertPrDt(@Param("prDtList") List<PrDtDTO> prDtDTOList);

    List<PrItemDTO> selectPrItem();
    List<PrItemDTO> selectPrItemInfo(@Param("itemCdList") List<String> itemCodeList);

    PrHdDTO selectPrNum(@Param("prNum") String prNum);
    void deletePrHd(@Param("prNum") String prNum);
    void deletePrDt(@Param("prNum") String prNum);

    List<PrListResponse> selectPrList(@Param("prNum") String prNum,
                                      @Param("prSubject") String prSubject,
                                      @Param("requester") String requester,
                                      @Param("deptName") String deptName,
                                      @Param("progressCd") String progressCd,
                                      @Param("startDate") String startDate,
                                      @Param("endDate") String endDate);


}

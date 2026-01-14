package com.company.erp.pr.mapper;

import com.company.erp.pr.dto.*;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface PrMapper {
    void insertPrHd(PrHdDTO prHdDTO);
    void insertPrDt(@Param("prDtList") List<PrDtDTO> prDtDTOList);

    List<PrItemDTO> selectPrItem();
    List<PrItemDTO> selectPrItemInfo(@Param("itemCdList") List<String> itemCodeList);

    PrHdDTO selectPrNum(@Param("prNum") String prNum);
    void deletePrHd(@Param("prNum") String prNum);
    void deletePrDt(@Param("prNum") String prNum);

    List<PrListResponse> selectPrList(String prNum,String prSubject,
                                      String reqUserId,String deptCd,
                                      String progressCd);


}

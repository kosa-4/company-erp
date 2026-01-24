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
                                      @Param("pcType") String pcType,
                                      @Param("requestDate") String requestDate,
                                      @Param("offset") Integer offset,
                                      @Param("pageSize") Integer pageSize,
                                      @Param("regUserId") String regUserId,
                                      @Param("isBuyerDept") Boolean isBuyerDept);
    
    // 구매요청 현황 목록 총 개수 조회
    int selectPrListCount(@Param("prNum") String prNum,
                         @Param("prSubject") String prSubject,
                         @Param("requester") String requester,
                         @Param("deptName") String deptName,
                         @Param("progressCd") String progressCd,
                         @Param("pcType") String pcType,
                         @Param("requestDate") String requestDate,
                         @Param("regUserId") String regUserId,
                         @Param("isBuyerDept") Boolean isBuyerDept);
    
    // 구매팀 여부 확인
    boolean isBuyerDept(@Param("deptCd") String deptCd);
    
    // 구매요청 상세 품목 목록 조회
    List<PrDtDTO> selectPrDetail(@Param("prNum") String prNum);


    int approvePr(@Param("userId") String userId, @Param("deptCd") String deptCd,
                              @Param("prNum") String prNum);

    void rejectPr(@Param("prNum") String prNum, @Param("userId") String userId, @Param("deptCd") String deptCd);

    // PROGRESS_CD의 CODE_NAME 조회 (승인 상태 확인)
    String selectProgressCdName(@Param("progressCd") String progressCd);

    // 구매요청 헤더 수정 (구매요청명, 구매유형만)
    int updatePrHd(@Param("prNum") String prNum, 
                    @Param("prSubject") String prSubject,
                    @Param("pcType") String pcType,
                    @Param("modUserId") String modUserId);

    // 구매요청 헤더 총액 업데이트
    int updatePrHdAmount(@Param("prNum") String prNum, 
                         @Param("prAmt") java.math.BigDecimal prAmt);

    // 구매요청 품목 수정 (수량, 단가) - 단일 품목
    int updatePrDt(@Param("prNum") String prNum,
                    @Param("itemCd") String itemCd,
                    @Param("prQt") java.math.BigDecimal prQt,
                    @Param("unitPrc") java.math.BigDecimal unitPrc,
                    @Param("prAmt") java.math.BigDecimal prAmt);

    // 구매요청 상태를 임시저장으로 변경
    int updatePrProgressToTemp(@Param("prNum") String prNum);

    // 부서 목록 조회 (숫자 제거, 중복 제거)
    List<String> selectDeptNameList(@Param("userDeptCd") String userDeptCd, @Param("isBuyerDept") Boolean isBuyerDept);

}

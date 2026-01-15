package com.company.erp.pr.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.pr.dto.*;
import com.company.erp.pr.mapper.PrMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@RequiredArgsConstructor
@Service
public class PrService {

    private final PrMapper prMapper;
    private final DocNumService docNumService;

    //초기 구매요청 화면 조회
    public Map<String,Object> initPurchaseData(String userId, String deptName){
        Map<String,Object> initData = new HashMap<>();

        String reqUserName = prMapper.selectUserName(userId);

        initData.put("reqUserNm",reqUserName);//세션 userid 이용해 사용자 테이블에서 갖고 올 예정
        initData.put("deptNm",deptName);//세션 userid 이용해 사용자 테이블에서 부서코드 -> 부서명 갖고 올 예정
        initData.put("prAmt", BigDecimal.ZERO);

        return initData;
    }


    //구매요청 등록
    @Transactional()
    public void insertPr(String userId, String deptCd, PrRequest prRequest){
        String prNum = docNumService.generateDocNumStr(DocKey.PR);//채번

        PrRequest.PrHd prHd = prRequest.getPrHd();
        List<PrRequest.PrDt> prDtList = prRequest.getPrDtList();


        List<String> prItemCdList = new ArrayList<>();
        for (PrRequest.PrDt prDt : prDtList) {
            prItemCdList.add(prDt.getItemCode());
        }


        List<PrItemDTO> prItemDTOS = prMapper.selectPrItemInfo(prItemCdList);//폼목 정보 가져오기


        Map<String, PrItemDTO> itemMap = new HashMap<>();
        for (PrItemDTO item : prItemDTOS) {
            itemMap.put(item.getItemCd(), item);
        }

        BigDecimal totalAmt = BigDecimal.ZERO;
        List<PrDtDTO> prDtDTOList = new ArrayList<>();


        //DT 생성 및 구매요청 총금액 계산
        for (PrRequest.PrDt reqDt : prDtList) {

            PrItemDTO item = itemMap.get(reqDt.getItemCode());

            BigDecimal qt = reqDt.getPrQt();//수량
            BigDecimal unitPrc = reqDt.getUnitPrc();//단가
            BigDecimal dtAmt = qt.multiply(unitPrc);//dt별 금액 계산

            totalAmt = totalAmt.add(dtAmt);

            //prDt에 들어갈 데이터 값 매핑
            PrDtDTO prDtDTO = PrDtDTO.builder()
                    .prNum(prNum)
                    .itemCd(reqDt.getItemCode())
                    .itemDesc(item.getItemNm())
                    .itemSpec(item.getItemSpec())
                    .unitCd(item.getUnitCd())
                    .prQt(qt)
                    .unitPrc(unitPrc)
                    .prAmt(dtAmt)
                    .delyDate(reqDt.getDelyDate())
                    .regUserId(userId)
                    .build();

            prDtDTOList.add(prDtDTO);
        }

        //prHd에 들어갈 데이터 값 매핑
        PrHdDTO prHdDTO = PrHdDTO.builder()
                .prNum(prNum)
                .regUserId(userId)
                .prSubject(prHd.getPrSubject())
                .deptCd(deptCd)
                .prAmt(totalAmt)
                .rmk(prHd.getRmk())
                .pcType(prHd.getPcType())
                .build();


        prMapper.insertPrHd(prHdDTO);
        prMapper.insertPrDt(prDtDTOList);
    }




    //구매요청에서의 품목 조회
    public List<PrItemDTO> selectPrItem(){
        List<PrItemDTO> prItems = prMapper.selectPrItem();

        return prItems;
    }


    //구매요청화면에서 품목정보 조회
    public List<PrItemDTO> selectPrItemInfo(List<String> itemCodeList){
        List<PrItemDTO> prItemInfoDTOS = prMapper.selectPrItemInfo(itemCodeList);

        return prItemInfoDTOS;
    }



    //구매요청현황 목록 조회(필터 처리 필요)
    public List<PrListResponse> selectPrList(String prNum, String prSubject,String requester,
                                             String deptNm, String progressCd, String startDate, String endDate){
        //페이징 처리 필요
        return prMapper.selectPrList(prNum,prSubject,requester,deptNm,progressCd,startDate,endDate);
    }

    //구매요청 삭제
    @Transactional
    public void deletePrRequest(String prNum, String itemCd){
        PrHdDTO prHd = prMapper.selectPrNum(prNum);

        if(prHd == null){
            throw new IllegalArgumentException("해당하는 구매요청이 존재하지 않습니다.");
        }
        if("Y".equals(prHd.getDelFlag())){
            throw new IllegalArgumentException("이미 삭제된 구매요청입니다.");
        }

        prMapper.deletePrHd(prNum);
        prMapper.deletePrDt(prNum);

    }

    //구매요청 수정



}

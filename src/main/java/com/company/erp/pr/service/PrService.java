package com.company.erp.pr.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.session.SessionUser;
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

        initData.put("reqUserNm",reqUserName);
        initData.put("deptNm",deptName);
        initData.put("prAmt", BigDecimal.ZERO);

        return initData;
    }


    //구매요청 등록
    @Transactional()
    public String insertPr(String userId, String deptCd, PrRequest prRequest){
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
                    .rmk(reqDt.getRmk())
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

        // 생성된 PR 번호 반환 (첨부파일 연계를 위해 사용)
        return prNum;
    }




    //구매요청에서의 품목 조회
    public List<PrItemDTO> selectPrItem(String itemCode, String itemName){
        List<PrItemDTO> prItems = prMapper.selectPrItem(itemCode, itemName);

        return prItems;
    }


    //구매요청화면에서 품목정보 조회
    public List<PrItemDTO> selectPrItemInfo(List<String> itemCodeList){
        List<PrItemDTO> prItemInfoDTOS = prMapper.selectPrItemInfo(itemCodeList);

        return prItemInfoDTOS;
    }



    //구매요청현황 목록 조회 (헤더만)
    public Map<String, Object> selectPrList(String prNum, String prSubject, String requester,
                                             String deptNm, String progressCd, String pcType, String requestDate,
                                             Integer page, Integer pageSize, SessionUser user){
        // 페이징 파라미터 기본값 설정
        if (page == null || page < 1) page = 1;
        if (pageSize == null || pageSize < 1) pageSize = 10;
        
        int offset = (page - 1) * pageSize;
        
        // 구매팀 여부 확인
        boolean isBuyerDept = false;
        String regUserId = null;
        
        // 구매사인 경우만 권한 체크
        if ("B".equals(user.getComType()) && user.getDeptCd() != null && !user.getDeptCd().isEmpty()) {
            // dept_role 테이블에서 BUYER 역할 확인
            isBuyerDept = prMapper.isBuyerDept(user.getDeptCd());
            
            // 구매팀이 아니면 본인이 작성한 구매요청만 조회
            if (!isBuyerDept) {
                regUserId = user.getUserId();
            }
        }
        
        // 목록 조회
        List<PrListResponse> list = prMapper.selectPrList(prNum, prSubject, requester, deptNm, progressCd, pcType, requestDate, offset, pageSize, regUserId, isBuyerDept);
        
        // 총 개수 조회
        int totalCount = prMapper.selectPrListCount(prNum, prSubject, requester, deptNm, progressCd, pcType, requestDate, regUserId, isBuyerDept);
        
        // 총 페이지 수 계산
        int totalPages = (int) Math.ceil((double) totalCount / pageSize);
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", list);
        result.put("totalCount", totalCount);
        result.put("totalPages", totalPages);
        result.put("currentPage", page);
        result.put("pageSize", pageSize);
        
        return result;
    }
    
    //구매요청 상세 품목 목록 조회
    public List<PrDtDTO> selectPrDetail(String prNum){
        return prMapper.selectPrDetail(prNum);
    }
    
    //구매요청 상세 조회 (헤더 + 품목)
    public PrDetailResponse selectPrDetailWithHeader(String prNum){
        // 헤더 조회
        PrHdDTO header = prMapper.selectPrNum(prNum);
        if(header == null){
            throw new IllegalArgumentException("해당하는 구매요청이 존재하지 않습니다.");
        }
        
        // 품목 목록 조회
        List<PrDtDTO> items = prMapper.selectPrDetail(prNum);
        
        // 요청자명 조회
        String reqUserName = prMapper.selectUserName(header.getRegUserId());
        
        // 날짜 변환
        String regDateStr = null;
        if (header.getRegDate() != null) {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            regDateStr = sdf.format(header.getRegDate());
        }
        
        // 응답 DTO 생성
        return PrDetailResponse.builder()
                .prNum(header.getPrNum())
                .prSubject(header.getPrSubject())
                .rmk(header.getRmk())
                .prAmt(header.getPrAmt())
                .pcType(header.getPcType())
                .progressCd(header.getProgressCd())
                .deptCd(header.getDeptCd())
                .regUserId(header.getRegUserId())
                .regDate(regDateStr)
                .reqUserName(reqUserName)
                .items(items)
                .build();
    }

    //구매요청 승인
    @Transactional
    public void approvePrRequest(String prNum, String userId, String deptCd){
        // 구매요청 존재 여부 확인
        PrHdDTO prHd = prMapper.selectPrNum(prNum);
        if(prHd == null){
            throw new IllegalArgumentException("해당하는 구매요청이 존재하지 않습니다.");
        }
        if("Y".equals(prHd.getDelFlag())){
            throw new IllegalArgumentException("이미 삭제된 구매요청입니다.");
        }

        // 승인 처리
        int updatedRows = prMapper.approvePr(userId, deptCd, prNum);
        
        if(updatedRows == 0){
            throw new IllegalStateException("구매요청 승인에 실패했습니다.");
        }
    }

    //구매요청 반려
    @Transactional
    public void rejectPr(String prNum, String userId, String deptCd){
        // 구매요청 존재 여부 확인
        PrHdDTO prHd = prMapper.selectPrNum(prNum);
        if(prHd == null){
            throw new IllegalArgumentException("해당하는 구매요청이 존재하지 않습니다.");
        }
        if("Y".equals(prHd.getDelFlag())){
            throw new IllegalArgumentException("존재하지 않는 구매요청입니다.");
        }

        // 반려 처리
        prMapper.rejectPr(prNum, userId, deptCd);

        PrHdDTO updatedPrHd = prMapper.selectPrNum(prNum);
        if(updatedPrHd == null || updatedPrHd.getProgressCd() == null){
            throw new IllegalStateException("구매요청 반려에 실패했습니다.");
        }
    }

    //구매요청 삭제
    @Transactional
    public void deletePrRequest(String prNum){
        PrHdDTO prHd = prMapper.selectPrNum(prNum);

        if(prHd == null){
            throw new IllegalArgumentException("해당하는 구매요청이 존재하지 않습니다.");
        }
        if("Y".equals(prHd.getDelFlag())){
            throw new IllegalArgumentException("이미 삭제된 구매요청입니다.");
        }
        
        // 승인 상태인 구매요청은 삭제 불가
        String progressCd = prHd.getProgressCd();
        if(progressCd != null && isApprovedStatus(progressCd)){
            throw new IllegalStateException("승인된 구매요청은 삭제할 수 없습니다.");
        }

        prMapper.deletePrHd(prNum);
        prMapper.deletePrDt(prNum);

    }
    
    //승인 상태 확인 메서드
    private boolean isApprovedStatus(String progressCd) {
        if (progressCd == null || progressCd.isEmpty()) {
            return false;
        }
        
        try {
            String codeName = prMapper.selectProgressCdName(progressCd);
            return "승인".equals(codeName);
        } catch (Exception e) {
            throw new IllegalArgumentException("진행 상태 조회에 실패하였습니다.");
        }
    }

    //구매요청 헤더 수정 (구매요청명, 구매유형만)
    @Transactional
    public void updatePr(String prNum, String prSubject, String pcType, String userId) {
        // 구매요청 존재 여부 확인
        PrHdDTO prHd = prMapper.selectPrNum(prNum);
        if (prHd == null) {
            throw new IllegalArgumentException("해당하는 구매요청이 존재하지 않습니다.");
        }
        if ("Y".equals(prHd.getDelFlag())) {
            throw new IllegalArgumentException("이미 삭제된 구매요청입니다.");
        }

        // 승인 상태인 구매요청은 수정 불가
        String progressCd = prHd.getProgressCd();
        if (progressCd != null && isApprovedStatus(progressCd)) {
            throw new IllegalStateException("승인된 구매요청은 수정할 수 없습니다.");
        }

        // 구매유형을 한글에서 코드로 변환하여 저장
        int updatedRows = prMapper.updatePrHd(prNum, prSubject, pcType, userId);
        if (updatedRows == 0) {
            throw new IllegalStateException("구매요청 수정에 실패했습니다.");
        }
    }

    //구매요청 헤더 + 품목 수정
    @Transactional
    public void updatePrWithItems(String prNum, String prSubject, String pcType, List<PrDtDTO> prDtList, String userId) {
        // 구매요청 존재 여부 확인
        PrHdDTO prHd = prMapper.selectPrNum(prNum);
        if (prHd == null) {
            throw new IllegalArgumentException("해당하는 구매요청이 존재하지 않습니다.");
        }
        if ("Y".equals(prHd.getDelFlag())) {
            throw new IllegalArgumentException("이미 삭제된 구매요청입니다.");
        }

        // 승인 상태인 구매요청은 수정 불가
        String progressCd = prHd.getProgressCd();
        if (progressCd != null && isApprovedStatus(progressCd)) {
            throw new IllegalStateException("승인된 구매요청은 수정할 수 없습니다.");
        }

        // 헤더 수정
        int headerUpdatedRows = prMapper.updatePrHd(prNum, prSubject, pcType, userId);
        if (headerUpdatedRows == 0) {
            throw new IllegalStateException("구매요청 수정에 실패했습니다.");
        }

        // 품목 수정
        if (prDtList != null && !prDtList.isEmpty()) {
            // 총액 계산 및 품목 금액 설정
            BigDecimal totalAmt = BigDecimal.ZERO;
            for (PrDtDTO dt : prDtList) {
                BigDecimal qt = dt.getPrQt() != null ? dt.getPrQt() : BigDecimal.ZERO;
                BigDecimal unitPrc = dt.getUnitPrc() != null ? dt.getUnitPrc() : BigDecimal.ZERO;
                BigDecimal dtAmt = qt.multiply(unitPrc);
                dt.setPrAmt(dtAmt);
                dt.setPrNum(prNum);
                totalAmt = totalAmt.add(dtAmt);
                
                // 각 품목을 개별 업데이트
                int itemUpdatedRows = prMapper.updatePrDt(
                    prNum,
                    dt.getItemCd(),
                    qt,
                    unitPrc,
                    dtAmt
                );
                
                if (itemUpdatedRows == 0) {
                    throw new IllegalStateException("품목 수정에 실패했습니다: " + dt.getItemCd());
                }
            }

            // 헤더 총액 업데이트
            prMapper.updatePrHdAmount(prNum, totalAmt);
        }
    }

}

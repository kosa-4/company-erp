package com.company.erp.pr.controller;

import com.company.erp.common.session.SessionIgnore;
import com.company.erp.pr.dto.PrItemDTO;
import com.company.erp.pr.dto.PrListResponse;
import com.company.erp.pr.dto.PrRequest;
import com.company.erp.pr.service.PrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pr")
@RequiredArgsConstructor
public class PrController {

    private final PrService prService;

    //구매요청화면 초기 데이터 조회
    @GetMapping("/init")
    public ResponseEntity<Map<String,Object>> initPurchase(){

        Map<String, Object> initData = prService.initPurchaseData();

        return ResponseEntity.ok(initData);
    }

    //구매요청화면 품목정보 조회
    @GetMapping("/item-info/list")
    public ResponseEntity<List<PrItemDTO>> getPrItemInfo(@RequestParam(required = false) List<String> itemCodes){

        //빈 경우(예외 처리 다시 할 예정)
        if(itemCodes == null || itemCodes.isEmpty()){
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<PrItemDTO> prItemInfoList = prService.selectPrItemInfo(itemCodes);

        return ResponseEntity.ok(prItemInfoList);
    }


    //구매요청 등록
    @PostMapping("/save")
    public ResponseEntity<String> savePurchaseRequest(@RequestBody PrRequest prRequest){

        prService.insertPr(prRequest);

        return ResponseEntity.ok().body("구매요청 등록 완료");
    }

    //품목선택 팝업에서의 품목 조회
    @GetMapping("/item/list")
    public ResponseEntity<List<PrItemDTO>> getPrItem(){
        List<PrItemDTO> prItems = prService.selectPrItem();

        return ResponseEntity.ok(prItems);
    }

    //구매요청 삭제
    @PutMapping("/{prNum}/delete")
    public ResponseEntity<String> deletePurchaseRequest(@PathVariable String prNum){
        prService.deletePrRequest(prNum);

        return ResponseEntity.ok().body("구매요청 삭제 완료");
    }


    //구매요청현황 조회
    @GetMapping("/list")                              //요청자,부서는 session 정보 통해 요청자 id값, 부서코드값으로 변경 예정
    public ResponseEntity<List<PrListResponse>> getPurchaseList(@RequestParam(required = false) String prNum,
                                                                @RequestParam(required = false) String prSubject,
                                                                @RequestParam(required = false) String requester,
                                                                @RequestParam(required = false) String deptName,
                                                                @RequestParam(required = false) String progressCd){

        List<PrListResponse> prList = prService.selectPrList(prNum,prSubject,requester,deptName,progressCd);

        return ResponseEntity.ok(prList);
    }
}

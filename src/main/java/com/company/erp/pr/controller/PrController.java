package com.company.erp.pr.controller;

import com.company.erp.common.session.SessionUser;
import com.company.erp.pr.dto.PrItemDTO;
import com.company.erp.pr.dto.PrListResponse;
import com.company.erp.pr.dto.PrRequest;
import com.company.erp.pr.service.PrService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pr")
@RequiredArgsConstructor
public class PrController {

    private final PrService prService;

    //구매요청화면 초기 데이터 조회
    @GetMapping("/init")
    public ResponseEntity<Map<String,Object>> initPurchase(HttpSession httpSession){
        SessionUser user = (SessionUser) httpSession.getAttribute(SessionUser.class.getName());
        String userId = user.getUserId();
        String deptName = user.getDeptName();

        Map<String, Object> initData = prService.initPurchaseData(userId,deptName);

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
    public ResponseEntity<Map<String,String>> savePurchaseRequest(HttpSession httpSession,
                                                                  @RequestBody PrRequest prRequest){

        SessionUser user = (SessionUser) httpSession.getAttribute(SessionUser.class.getName());
        String userId = user.getUserId();
        String deptCd = user.getDeptCd();

        prService.insertPr(userId,deptCd,prRequest);

        Map<String, String> response = new HashMap<>();
        response.put("message", "구매요청 등록 완료");
        return ResponseEntity.ok(response);
    }

    //품목선택 팝업에서의 품목 조회
    @GetMapping("/item/list")
    public ResponseEntity<List<PrItemDTO>> getPrItem(){
        List<PrItemDTO> prItems = prService.selectPrItem();

        return ResponseEntity.ok(prItems);
    }


    //구매요청현황 조회
    @GetMapping("/list")
    public ResponseEntity<List<PrListResponse>> getPurchaseList(@RequestParam(required = false) String prNum,
                                                                @RequestParam(required = false) String prSubject,
                                                                @RequestParam(required = false) String requester,
                                                                @RequestParam(required = false) String deptName,
                                                                @RequestParam(required = false) String progressCd,
                                                                @RequestParam(required = false) String startDate,
                                                                @RequestParam(required = false) String endDate){

        List<PrListResponse> prList = prService.selectPrList(prNum,prSubject,requester,deptName,progressCd,startDate,endDate);

        return ResponseEntity.ok(prList);
    }

    //구매요청 삭제
    @PutMapping("/delete")
    public ResponseEntity<Map<String,String>> deletePurchaseRequest(@RequestParam(required = true) String prNum,
                                                                    @RequestParam(required = true) String itemCd){
        prService.deletePrRequest(prNum,itemCd);

        Map<String, String> response = new HashMap<>();
        response.put("message", "구매요청 삭제완료");
        return ResponseEntity.ok().body(response);
    }
}

package com.company.erp.pr.controller;

import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import com.company.erp.pr.dto.*;
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
        SessionUser user = getSessionUser(httpSession);
        
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

        SessionUser user = getSessionUser(httpSession);
        
        String userId = user.getUserId();
        String deptCd = user.getDeptCd();

        prService.insertPr(userId,deptCd,prRequest);

        Map<String, String> response = new HashMap<>();
        response.put("message", "구매요청 등록 완료");
        return ResponseEntity.ok(response);
    }

    //품목선택 팝업에서의 품목 조회
    @GetMapping("/item/list")
    public ResponseEntity<List<PrItemDTO>> getPrItem(
            @RequestParam(required = false) String itemCode,
            @RequestParam(required = false) String itemName){
        List<PrItemDTO> prItems = prService.selectPrItem(itemCode, itemName);

        return ResponseEntity.ok(prItems);
    }


    //구매요청현황 목록 조회 (헤더만) - 페이징 포함
    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getPurchaseList(@RequestParam(required = false) String prNum,
                                                                 @RequestParam(required = false) String prSubject,
                                                                 @RequestParam(required = false) String requester,
                                                                 @RequestParam(required = false) String deptName,
                                                                 @RequestParam(required = false) String progressCd,
                                                                 @RequestParam(required = false) String requestDate,
                                                                 @RequestParam(required = false, defaultValue = "1") Integer page,
                                                                 @RequestParam(required = false, defaultValue = "10") Integer pageSize,
                                                                 HttpSession session){

        SessionUser user = getSessionUser(session);
        Map<String, Object> result = prService.selectPrList(prNum, prSubject, requester, deptName, progressCd, requestDate, page, pageSize, user);

        return ResponseEntity.ok(result);
    }
    
    //구매요청 상세 품목 목록 조회
    @GetMapping("/{prNum}/detail")
    public ResponseEntity<PrDetailResponse> getPurchaseDetail(@PathVariable String prNum){
        PrDetailResponse detail = prService.selectPrDetailWithHeader(prNum);
        
        return ResponseEntity.ok(detail);
    }

    //구매요청 헤더 수정 (구매요청명, 구매유형만) 또는 헤더+품목 수정
    @PutMapping("/{prNum}/update")
    public ResponseEntity<Map<String, String>> updatePurchaseRequest(
            @PathVariable String prNum,
            @RequestBody Map<String, Object> request,
            HttpSession session) {
        
        SessionUser user = getSessionUser(session);

        String prSubject = (String) request.get("prSubject");
        String pcType = (String) request.get("pcType");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> prDtList = (List<Map<String, Object>>) request.get("prDtList");

        if (prSubject == null || prSubject.trim().isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "구매요청명은 필수입니다.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        // 품목 목록이 있으면 헤더+품목 수정, 없으면 헤더만 수정
        if (prDtList != null && !prDtList.isEmpty()) {
            // 품목 DTO 변환
            List<PrDtDTO> prDtDTOList = prDtList.stream().map(item -> {
                PrDtDTO dto = new PrDtDTO();
                dto.setItemCd((String) item.get("itemCd"));
                dto.setPrQt(item.get("prQt") != null ? 
                    new java.math.BigDecimal(item.get("prQt").toString()) : null);
                dto.setUnitPrc(item.get("unitPrc") != null ? 
                    new java.math.BigDecimal(item.get("unitPrc").toString()) : null);
                return dto;
            }).collect(java.util.stream.Collectors.toList());

            prService.updatePrWithItems(prNum, prSubject, pcType, prDtDTOList, user.getUserId());
        } else {
            prService.updatePr(prNum, prSubject, pcType, user.getUserId());
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "구매요청이 수정되었습니다.");
        return ResponseEntity.ok(response);
    }

    //구매요청 삭제
    @PutMapping("/{prNum}/delete")
    public ResponseEntity<Map<String,String>> deletePurchaseRequest(@PathVariable String prNum){
        prService.deletePrRequest(prNum);

        Map<String, String> response = new HashMap<>();
        response.put("message", "구매요청이 삭제되었습니다.");
        return ResponseEntity.ok().body(response);
    }
    
    //구매요청 승인
    @PostMapping("/{prNum}/approve")
    public ResponseEntity<Map<String,String>> approvePurchaseRequest(@PathVariable String prNum,
                                                                     HttpSession httpSession){
        SessionUser user = getSessionUser(httpSession);
        
        if (user == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "로그인 정보가 없습니다.");
            return ResponseEntity.status(401).body(errorResponse);
        }
        
        String userId = user.getUserId();
        String deptCd = user.getDeptCd();
        
        prService.approvePrRequest(prNum, userId, deptCd);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "구매요청이 승인되었습니다.");
        return ResponseEntity.ok().body(response);
    }
    
    //구매요청 반려
    @PostMapping("/{prNum}/reject")
    public ResponseEntity<Map<String,String>> rejectPurchaseRequest(@PathVariable String prNum,
                                                                    HttpSession httpSession){
        SessionUser user = getSessionUser(httpSession);
        
        String userId = user.getUserId();
        String deptCd = user.getDeptCd();
        
        prService.rejectPr(prNum, userId, deptCd);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "구매요청이 반려되었습니다.");
        return ResponseEntity.ok().body(response);
    }

    //세션에서 로그인한 사용자 정보를 가져오는 메서드
    private SessionUser getSessionUser(HttpSession session) {
        if (session == null) {
            return null;
        }
        Object obj = session.getAttribute(SessionConst.LOGIN_USER);
        return (obj instanceof SessionUser) ? (SessionUser) obj : null;
    }
}

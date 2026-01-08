package com.company.erp.inventory.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.inventory.dto.GrDetailDTO;
import com.company.erp.inventory.dto.GrHeaderDTO;
import com.company.erp.inventory.dto.ReceivingTargetDTO;
import com.company.erp.inventory.enums.GrStatusCode;
import com.company.erp.inventory.mapper.InventoryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryMapper inventoryMapper;
    private final DocNumService docNumService;

    // ========== 입고대상 조회 ==========

    /**
     * 입고대상 조회
     *
     * 조건:
     * - 발주 전송 상태인 품목
     * - 미입고 또는 부분입고 상태
     */
    public List<ReceivingTargetDTO> getReceivingTargets(
            String poNo, String poName, String buyer,
            String vendor, String item, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("poNo", poNo);
        params.put("poName", poName);
        params.put("buyer", buyer);
        params.put("vendor", vendor);
        params.put("item", item);
        params.put("startDate", startDate);
        params.put("endDate", endDate);

        return inventoryMapper.selectReceivingTargets(params);
    }

    // ========== 입고 목록 조회 ==========

    /**
     * 입고 목록 조회
     *
     * CODD JOIN으로 코드명이 자동 조회됨 (변환 불필요)
     */

    public List<GrHeaderDTO> getGrList(
            String grNo, String receiver, String vendor,
            String item, String startDate, String endDate, String status) {
        Map<String, Object> params = new HashMap<>();
        params.put("grNo", grNo);
        params.put("receiver", receiver);
        params.put("vendor", vendor);
        params.put("itme", item);
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        params.put("status", status);

        return inventoryMapper.selectGrHeaderList(params);
    }

    // ========== 입고 상세 조회 ==========

    /**
     * 입고 상세 조회
     */
    public GrHeaderDTO getGrDetail(String grNo) {
        GrHeaderDTO header = inventoryMapper.selectGrHeader(grNo);
        if (header == null) {
            throw new NoSuchElementException("입고 정보를 찾을 수 없습니다: " + grNo);
        }
        List<GrDetailDTO> details = inventoryMapper.selectGrDetails(grNo);
        header.setItems(details);

        return header;
    }

    // ========== 입고 등록 ==========

    /**
     * 입고 등록
     *
     * 처리 순서:
     * 1. 입고번호 생성
     * 2. 총액 계산
     * 3. 헤더 등록
     * 4. 상세 등록
     * 5. 상태 자동 업데이트
     */
    @Transactional
    public GrHeaderDTO createGr(GrHeaderDTO dto, String regUserId) {
        // 1. 입고번호 생성
        String grNo = docNumService.generateDocNumStr(DocKey.GR);
        dto.setGrNo(grNo);

        // 2. 총액 계산
        BigDecimal totalAmount = dto.getItems().stream()
            .map(GrDetailDTO::getReceivedAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);

        // 3. 헤더 등록
        inventoryMapper.insertGrHeader(dto, regUserId);

        // 4. 상세 등록
        for (GrDetailDTO detail : dto.getItems()) {
            detail.setGrNo(grNo);

            // 입고 금액 자동 계산 (단가 x 입고수량)
            if (detail.getReceivedAmount() == null) {
                BigDecimal amount = detail.getUnitPrice()
                    .multiply(BigDecimal.valueOf(detail.getReceivedQuantity()));
                detail.setReceivedAmount(amount);
            }

            inventoryMapper.insertGrDetail(detail, regUserId);
        }

        // 5. 상태 자동 업데이트 (부분입고/완료)
        updateGrStatus(grNo, regUserId);

        return getGrDetail(grNo);
    }

    // ========== 입고 수정 ==========

     /**
     * 입고 수정
     *
     * 처리 순서:
     * 1. 기존 데이터 확인
     * 2. 총액 재계산
     * 3. 헤더 수정
     * 4. 상세 수정 (기존 삭제 후 재등록)
     * 5. 상태 재확인
     */
    @Transactional
    public GrHeaderDTO updateGr(String grNo, GrHeaderDTO dto, String modUserId) {
        // 1. 기존 데이터 확인
        GrHeaderDTO existing = inventoryMapper.selectGrHeader(grNo);
        if (existing == null) {
            throw new NoSuchElementException("입고 정보를 찾을 수 없습니다: " + grNo);
        }
        dto.setGrNo(grNo);

        // 2. 총액 재계산
        BigDecimal totalAmount = dto.getItems().stream()
            .map(GrDetailDTO::getReceivedAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);

        // 3. 헤더 수정
        inventoryMapper.updateGrHeader(dto, modUserId);

        // 4. 상세 수정 (기존 삭제 후 재등록)
        inventoryMapper.deleteGrDetails(grNo);
        for (GrDetailDTO detail : dto.getItems()) {
            detail.setGrNo(grNo);
            if (detail.getReceivedAmount() == null) {
                BigDecimal amount = detail.getUnitPrice()
                    .multiply(BigDecimal.valueOf(detail.getReceivedQuantity()));
                detail.setReceivedAmount(amount);
            }
            inventoryMapper.insertGrDetail(detail, modUserId);
        }

        // 5. 상태 재확인
        updateGrStatus(grNo, modUserId);

        return getGrDetail(grNo);
    }

    // ========== 입고 취소 ==========

    /**
     * 입고 취소
     *
     * 상태만 '입고취소(GRN)'로 변경
     */
    @Transactional
    public void cancelGr(String grNo, String modUserId) {
        GrHeaderDTO existing = inventoryMapper.selectGrHeader(grNo);
        if (existing == null) {
            throw new NoSuchElementException("입고 정보를 찾을 수 없습니다: " + grNo);
        }
        inventoryMapper.cancelGr(grNo, modUserId);
    }

    // ========== 입고조정 ==========

    /**
     * 입고조정
     *
     * 부분입고 상태의 입고건에 대해 수정
     * - 기존 데이터를 삭제하지 않고 부분 수정만 수행
     * - 수정 가능 필드: 입고수량, 저장위치
     *
     * @param grNo 입고번호
     * @param adjustments 조정할 상세 목록
     * @param modUserId 수정자 ID
     * @return 조정된 입고 정보
     */
    @Transactional
    public GrHeaderDTO adjustGr(String grNo, List<GrDetailDTO> adjustments, String modUserId) {
        // 1. 기존 데이터 확인
        GrHeaderDTO existing = inventoryMapper.selectGrHeader(grNo);
        if (existing == null) {
            throw new NoSuchElementException("입고 정보를 찾을 수 없습니다: " + grNo);
        }

        // 2. 부분입고 상태 확인 (부분입고 상태만 조정 가능)
       
        // existing.getStatus()가 코드명일 수도 있으니, 코드값으로 변환 후 비교
        if (!GrStatusCode.GRP.equals(existing.getStatus())) {
            throw new IllegalStateException("부분입고 상태만 조정할 수 있습니다. 현재 상태: " + existing.getStatus());
        }

        // 3. 상세 부분 수정 (입고수량, 저장위치만)
        BigDecimal newTotalAmount = BigDecimal.ZERO;
        for (GrDetailDTO detail : adjustments) {
            detail.setGrNo(grNo);

            // 입고금액 자동 계산 (단가 × 입고수량)
            if (detail.getReceivedAmount() == null && detail.getUnitPrice() != null) {
                BigDecimal amount = detail.getUnitPrice()
                    .multiply(BigDecimal.valueOf(detail.getReceivedQuantity()));
                detail.setReceivedAmount(amount);
            }

            // 부분 수정 (입고수량, 저장위치만 UPDATE)
            inventoryMapper.updateGrDetailPartial(detail, modUserId);

            if (detail.getReceivedAmount() != null) {
                newTotalAmount = newTotalAmount.add(detail.getReceivedAmount());
            }
        }

        // 4. 헤더 총액 업데이트
        existing.setTotalAmount(newTotalAmount);
        inventoryMapper.updateGrHeader(existing, modUserId);

        // 5. 상태 재확인 (입고완료 여부)
        updateGrStatus(grNo, modUserId);

        return getGrDetail(grNo);
    }

    // ========== 내부 메서드 ==========
    /**
     * 상태 자동 업데이트
     *
     * 모든 품목의 누적 입고수량이 발주수량 이상이면 '입고완료'
     * 그렇지 않으면 '부분입고'
     */
    private void updateGrStatus(String grNo, String userId) {
        List<GrDetailDTO> details = inventoryMapper.selectGrDetails(grNo);

        boolean allComplete = true;
        for (GrDetailDTO detail : details) {
            // 누적 입고수량이 발주수량 이상인지 확인
            if (!GrStatusCode.canComplete(
                    detail.getOrderQuantity(),
                    detail.getCumulativeQuantity())) {
                allComplete = false;
                break;
            }
        }

        // 상태 업데이트
        String newStatus = allComplete ? GrStatusCode.GRE : GrStatusCode.GRP;
        GrHeaderDTO dto = new GrHeaderDTO();
        dto.setGrNo(grNo);
        dto.setStatus(newStatus);
        inventoryMapper.updateGrHeader(dto, userId);
    }
}

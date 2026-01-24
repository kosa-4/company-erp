package com.company.erp.inventory.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import com.company.erp.common.session.SessionConst;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.session.SessionUser;
import com.company.erp.inventory.constants.GoodsReceiptStatus;
import com.company.erp.inventory.dto.GoodsReceiptDTO;
import com.company.erp.inventory.dto.GoodsReceiptItemDTO;
import com.company.erp.inventory.mapper.GoodsReceiptMapper;
import com.company.erp.po.dto.PurchaseOrderDTO;
import com.company.erp.po.dto.PurchaseOrderItemDTO;
import com.company.erp.po.enums.PoStatusCode;
import com.company.erp.po.mapper.PurchaseOrderMapper;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GoodsReceiptService {

    private final GoodsReceiptMapper goodsReceiptMapper;
    private final DocNumService docNumService;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final HttpSession httpSession;

    // 입고대상조회: 입고 가능한 PO 목록 (품목 정보 포함)
    public List<PurchaseOrderDTO> getPendingPOList(
            String poNo, String poName, String vendorName, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("poNo", poNo);
        params.put("poName", poName);
        params.put("vendorName", vendorName);
        params.put("startDate", startDate);
        params.put("endDate", endDate);

        List<PurchaseOrderDTO> list = goodsReceiptMapper.selectPendingPOList(params);

        // 각 PO에 대해 품목 상세 조회하여 추가
        for (PurchaseOrderDTO po : list) {
            if (po.getPoNo() != null) {
                List<PurchaseOrderItemDTO> items = purchaseOrderMapper.selectItems(po.getPoNo());

                // 각 품목별 남은 입고 수량 및 기존 GR 저장위치 계산 (품목별 개별 관리)
                for (PurchaseOrderItemDTO item : items) {
                    // 입고된 수량 조회
                    Integer receivedQty = goodsReceiptMapper.getReceivedQuantity(po.getPoNo(), item.getItemCode());
                    if (receivedQty == null)
                        receivedQty = 0;

                    int remaining = item.getOrderQuantity() - receivedQty;
                    item.setRemainingQuantity(Math.max(0, remaining));

                    // 품목별로 기존 GR 저장위치 조회 (입고번호 기준)
                    String existingWarehouse = goodsReceiptMapper.selectWarehouseByPoAndItem(po.getPoNo(), item.getItemCode());
                    // 기존 GR이 있으면 별도 필드에 저장 (storageLocation은 원래 값 유지)
                    item.setExistingGrWarehouse(existingWarehouse);
                }

                po.setItems(items);
            }
        }

        return list;
    }

    // 발주번호로 기존 GR 정보 조회 (API용)
    public Map<String, Object> getExistingGrInfo(String poNo) {
        return goodsReceiptMapper.selectExistingGrByPoNo(poNo);
    }

    // 입고현황 목록 조회
    public List<GoodsReceiptDTO> getList(
            String grNo, String vendorName, String status, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("grNo", grNo);
        params.put("vendorName", vendorName);
        params.put("status", status);
        params.put("startDate", startDate);
        params.put("endDate", endDate);

        List<GoodsReceiptDTO> list = goodsReceiptMapper.selectList(params);

        // 각 입고 건에 대해 품목 상세 조회하여 추가
        for (GoodsReceiptDTO gr : list) {
            if (gr.getGrNo() != null) {
                List<GoodsReceiptItemDTO> items = goodsReceiptMapper.selectItems(gr.getGrNo());
                gr.setItems(items);
            }
        }

        return list;
    }

    // 입고 상세 조회
    public GoodsReceiptDTO getDetail(String grNo) {
        GoodsReceiptDTO header = goodsReceiptMapper.selectHeader(grNo);
        if (header == null) {
            throw new NoSuchElementException("입고를 찾을 수 없습니다: " + grNo);
        }

        List<GoodsReceiptItemDTO> items = goodsReceiptMapper.selectItems(grNo);
        header.setItems(items);

        return header;
    }

    // 입고 등록
    @Transactional
    public GoodsReceiptDTO create(GoodsReceiptDTO dto) {
        // ========== Validation ==========
        // PO번호 필수
        if (dto.getPoNo() == null || dto.getPoNo().isBlank()) {
            throw new IllegalArgumentException("발주 정보는 필수입니다.");
        }
        // 품목 필수
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new IllegalArgumentException("입고 품목이 없습니다.");
        }
        // 품목별 Validation
        for (int i = 0; i < dto.getItems().size(); i++) {
            GoodsReceiptItemDTO item = dto.getItems().get(i);
            if (item.getGrQuantity() == null || item.getGrQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException((i + 1) + "번째 품목의 입고수량이 유효하지 않습니다.");
            }
        }
        // ========== End Validation ==========

        // 현재 사용자 ID, 부서 가져오기
        String currentUserId = getCurrentUserId();
        String currentDeptCd = getCurrentUserDeptCd();

        // 1. PO 정보 및 협력사 코드 조회
        PurchaseOrderDTO poHeader = purchaseOrderMapper.selectHeader(dto.getPoNo());
        if (poHeader == null) {
            throw new NoSuchElementException("발주 정보를 찾을 수 없습니다: " + dto.getPoNo());
        }
        String vendorCode = poHeader.getVendorCode();

        // 규격 매핑 정보 준비
        Map<String, String> poSpecMap = new HashMap<>();
        List<PurchaseOrderItemDTO> poItems = purchaseOrderMapper.selectItems(dto.getPoNo());
        for (PurchaseOrderItemDTO poItem : poItems) {
            poSpecMap.put(poItem.getItemCode(), poItem.getSpecification());
        }

        // 2. 신규 입고 품목과 기존 입고(추가) 품목 분류
        List<GoodsReceiptItemDTO> newItems = new java.util.ArrayList<>();
        List<GoodsReceiptItemDTO> updateItems = new java.util.ArrayList<>();

        for (GoodsReceiptItemDTO item : dto.getItems()) {
            // 해당 품목에 대한 기존 GR 문서가 있는지 확인 (PO내 품목별 유일성 보장)
            String existingGrNo = goodsReceiptMapper.selectExistingGrByPoAndItem(dto.getPoNo(), item.getItemCode());
            if (existingGrNo != null) {
                item.setGrNo(existingGrNo);
                updateItems.add(item);
            } else {
                newItems.add(item);
            }
        }

        String lastProcessedGrNo = null;

        // 3. 기존 입고 건 업데이트 처리
        for (GoodsReceiptItemDTO item : updateItems) {
            item.setVendorCode(vendorCode);
            item.setCtrlUserId(currentUserId);
            item.setCtrlDeptCd(currentDeptCd);

            if (poSpecMap.containsKey(item.getItemCode())) {
                item.setItemSpec(poSpecMap.get(item.getItemCode()));
            }

            List<GoodsReceiptItemDTO> dbItems = goodsReceiptMapper.selectItems(item.getGrNo());
            GoodsReceiptItemDTO existing = dbItems.stream()
                    .filter(i -> i.getItemCode().equals(item.getItemCode()))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                // 기존 수량/금액 + 입력된 수량/금액 (누적)
                BigDecimal newQty = existing.getGrQuantity().add(item.getGrQuantity());
                BigDecimal newAmt = existing.getGrAmount().add(item.getGrAmount());
                item.setGrQuantity(newQty);
                item.setGrAmount(newAmt);
                // 기존 창고 유지 (입력값 없으면)
                if (item.getWarehouseCode() == null)
                    item.setWarehouseCode(existing.getWarehouseCode());

                goodsReceiptMapper.updateItem(item, currentUserId);
                recalculateHeaderAmount(item.getGrNo(), currentUserId);
                lastProcessedGrNo = item.getGrNo();
            }
        }

        // 4. 신규 입고 건 생성 처리 (신규 품목끼리는 하나의 문서로 묶음)
        if (!newItems.isEmpty()) {
            String newGrNo = docNumService.generateDocNumStr(DocKey.GR);

            // 신규 총액 계산
            BigDecimal newTotalAmount = newItems.stream()
                    .map(GoodsReceiptItemDTO::getGrAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 헤더 생성
            GoodsReceiptDTO newHeader = new GoodsReceiptDTO();
            newHeader.setGrNo(newGrNo);
            newHeader.setPoNo(dto.getPoNo());
            newHeader.setGrDate(dto.getGrDate() != null ? dto.getGrDate() : LocalDate.now());
            newHeader.setStatus(GoodsReceiptStatus.PARTIAL);
            newHeader.setTotalAmount(newTotalAmount);
            newHeader.setRemark(dto.getRemark());

            goodsReceiptMapper.insertHeader(newHeader, currentUserId, currentDeptCd);

            // 아이템 Insert
            for (GoodsReceiptItemDTO item : newItems) {
                item.setGrNo(newGrNo);
                item.setVendorCode(vendorCode);
                item.setCtrlUserId(currentUserId);
                item.setCtrlDeptCd(currentDeptCd);

                if (poSpecMap.containsKey(item.getItemCode())) {
                    item.setItemSpec(poSpecMap.get(item.getItemCode()));
                }
                if (item.getStatusCode() == null || item.getStatusCode().isEmpty())
                    item.setStatusCode("N");
                if (item.getGrDate() == null)
                    item.setGrDate(LocalDateTime.now());

                goodsReceiptMapper.insertItem(item);
            }
            lastProcessedGrNo = newGrNo;
        }

        // 5. 전체 상태 업데이트
        updateHeaderStatusByPO(dto.getPoNo(), lastProcessedGrNo, currentUserId);

        return lastProcessedGrNo != null ? getDetail(lastProcessedGrNo) : null;
    }

    // 입고 품목 수정
    @Transactional
    public GoodsReceiptDTO updateItem(String grNo, String itemCode, GoodsReceiptItemDTO item) {
        // 기존 입고 확인
        GoodsReceiptDTO existing = goodsReceiptMapper.selectHeader(grNo);
        if (existing == null) {
            throw new NoSuchElementException("입고를 찾을 수 없습니다: " + grNo);
        }

        item.setGrNo(grNo);
        item.setItemCode(itemCode);

        // 현재 사용자 ID 가져오기
        String currentUserId = getCurrentUserId();

        // 품목 수정
        goodsReceiptMapper.updateItem(item, currentUserId);

        // 헤더 총액 재계산
        recalculateHeaderAmount(grNo, currentUserId);

        // PO의 입고 상태 재계산
        updateHeaderStatusByPO(existing.getPoNo(), grNo, currentUserId);

        return getDetail(grNo);
    }

    // 입고 품목 취소
    @Transactional
    public GoodsReceiptDTO cancelItem(String grNo, String itemCode, String cancelRemark) {
        // 기존 입고 확인
        GoodsReceiptDTO existing = goodsReceiptMapper.selectHeader(grNo);
        if (existing == null) {
            throw new NoSuchElementException("입고를 찾을 수 없습니다: " + grNo);
        }

        // 취소 사유 필수 검증
        if (cancelRemark == null || cancelRemark.isBlank()) {
            throw new IllegalArgumentException("취소 사유는 필수입니다.");
        }

        // 현재 사용자 ID 가져오기
        String currentUserId = getCurrentUserId();

        // 품목 취소 처리
        goodsReceiptMapper.cancelItem(grNo, itemCode, cancelRemark, currentUserId);

        // 모든 품목이 취소되었는지 확인
        boolean allCancelled = goodsReceiptMapper.isAllItemsCancelled(grNo);
        if (allCancelled) {
            // 모든 품목이 취소되면 헤더 상태를 입고취소로 변경
            goodsReceiptMapper.updateHeaderStatus(grNo, GoodsReceiptStatus.CANCELLED, currentUserId);
        } else {
            // PO의 입고 상태 재계산
            updateHeaderStatusByPO(existing.getPoNo(), grNo, currentUserId);
        }

        return getDetail(grNo);
    }

    // 헤더 총액 재계산
    private void recalculateHeaderAmount(String grNo, String userId) {
        List<GoodsReceiptItemDTO> items = goodsReceiptMapper.selectItems(grNo);
        BigDecimal totalAmount = items.stream()
                .filter(item -> "N".equals(item.getStatusCode())) // 정상 상태만
                .map(GoodsReceiptItemDTO::getGrAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        GoodsReceiptDTO header = goodsReceiptMapper.selectHeader(grNo);
        if (header != null) {
            header.setTotalAmount(totalAmount);
            // 총액 업데이트는 별도 Mapper 메서드가 필요할 수 있음
            // 현재는 헤더 조회 시 자동 계산되므로 생략 가능
        }
    }

    // PO의 입고 상태에 따라 헤더 상태 업데이트
    private void updateHeaderStatusByPO(String poNo, String grNo, String userId) {
        if (poNo == null || poNo.isEmpty()) {
            return;
        }

        // PO의 누적 입고수량 조회
        BigDecimal accumulatedQty = goodsReceiptMapper.selectAccumulatedQty(poNo);

        // PO의 발주수량 합계 조회
        BigDecimal orderQty = goodsReceiptMapper.selectOrderQty(poNo);

        // 상태 결정
        String newStatus;
        if (accumulatedQty.compareTo(BigDecimal.ZERO) == 0) {
            // 입고수량이 0이면 미입고
            newStatus = GoodsReceiptStatus.NOT_RECEIVED;
        } else if (accumulatedQty.compareTo(orderQty) >= 0) {
            // 입고수량 >= 발주수량: 입고완료
            newStatus = GoodsReceiptStatus.COMPLETED;
        } else {
            // 입고수량 < 발주수량: 부분입고
            newStatus = GoodsReceiptStatus.PARTIAL;
        }

        // 헤더 상태 업데이트
        // 특정 PO에 연결된 모든 입고 헤더 상태 일괄 업데이트 (취소 상태 제외)
        // 이를 통해 부분입고였던 이전 GR 건들도 입고완료 시점에 일괄적으로 입고완료 처리됨
        goodsReceiptMapper.updateAllHeadersStatusByPO(poNo, newStatus, userId);

        // 입고완료(GRE) 상태가 되면 PO 상태를 'C'(완료)로 자동 변경
        if (GoodsReceiptStatus.COMPLETED.equals(newStatus)) {
            purchaseOrderMapper.updateStatus(poNo, PoStatusCode.COMPLETED.getCode(), userId);
        }
    }

    // 세션에서 로그인 사용자 정보 가져오기
    private SessionUser getSessionUser() {
        Object sessionAttr = httpSession.getAttribute(SessionConst.LOGIN_USER);
        return (sessionAttr instanceof SessionUser) ? (SessionUser) sessionAttr : null;
    }

    // 현재 사용자 ID 가져오기 (세션에서)
    private String getCurrentUserId() {
        SessionUser user = getSessionUser();
        return user != null ? user.getUserId() : "SYSTEM";
    }

    // 현재 사용자 부서 코드 가져오기 (세션에서)
    private String getCurrentUserDeptCd() {
        SessionUser user = getSessionUser();
        return user != null ? user.getDeptCd() : null;
    }
}

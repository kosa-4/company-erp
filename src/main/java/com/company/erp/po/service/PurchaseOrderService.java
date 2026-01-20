package com.company.erp.po.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import com.company.erp.common.session.SessionConst;
import com.company.erp.common.util.AesCryptoUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.session.SessionUser;
import com.company.erp.po.dto.PurchaseOrderDTO;
import com.company.erp.po.dto.PurchaseOrderItemDTO;
import com.company.erp.po.enums.*;
import com.company.erp.po.mapper.PurchaseOrderMapper;
import com.company.erp.rfq.dto.RfqSelectedDTO;
import com.company.erp.rfq.dto.RfqSelectedItemDTO;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderMapper purchaseOrderMapper;
    private final DocNumService docNumService;
    private final HttpSession httpSession;

    @Value("${app.crypto.key}")
    private String cryptoKey;

    // ========== 발주대기 조회 (RFQ 선정완료) ==========
    public List<RfqSelectedDTO> getRfqSelectedList(
            String rfqNo, String rfqName, String vendorName,
            String purchaseType, String startDate, String endDate) {
        Map<String, Object> params = new HashMap<>();
        params.put("rfqNo", rfqNo);
        params.put("rfqName", rfqName);
        params.put("vendorName", vendorName);
        params.put("purchaseType", purchaseType);
        params.put("startDate", startDate);
        params.put("endDate", endDate);

        List<RfqSelectedDTO> list = purchaseOrderMapper.selectRfqSelectedList(params);

        // 각 RFQ에 대해 품목 상세 조회하여 추가 및 복호화
        for (RfqSelectedDTO rfq : list) {
            // 헤더 총액 복호화 (안전 처리)
            rfq.setRfqAmount(decryptSafe(rfq.getRfqAmount()));

            if (rfq.getRfqNo() != null) {
                List<RfqSelectedItemDTO> items;
                // 긴급(E) 또는 단가계약(C) 인 경우 PR 아이템 조회 (단, rfqNo는 prNo로 alias 되어있음)
                if ("E".equals(rfq.getPurchaseType()) || "C".equals(rfq.getPurchaseType())) {
                    items = purchaseOrderMapper.selectPrItemsAsRfqItems(rfq.getRfqNo());
                } else {
                    items = purchaseOrderMapper.selectRfqSelectedItems(rfq.getRfqNo());
                }

                // 품목별 단가/금액 복호화 (안전 처리)
                if (items != null) {
                    for (RfqSelectedItemDTO item : items) {
                        item.setUnitPrice(decryptSafe(item.getUnitPrice()));
                        item.setAmount(decryptSafe(item.getAmount()));
                    }
                }
                rfq.setItems(items);
            }
        }

        return list;
    }

    // 목록 조회
    public List<PurchaseOrderDTO> getList(
            String poNo, String poName,
            String purchaseManager, String vendorName,
            String startDate, String endDate, String status) {
        Map<String, Object> params = new HashMap<>();
        params.put("poNo", poNo);
        params.put("poName", poName);
        params.put("purchaseManager", purchaseManager);
        params.put("vendorName", vendorName);
        params.put("startDate", startDate);
        params.put("endDate", endDate);
        params.put("status", status);

        List<PurchaseOrderDTO> list = purchaseOrderMapper.selectList(params);

        // 각 PO에 대해 품목 상세 조회하여 추가
        for (PurchaseOrderDTO po : list) {
            if (po.getPoNo() != null) {
                List<PurchaseOrderItemDTO> items = purchaseOrderMapper.selectItems(po.getPoNo());
                po.setItems(items);
            }
        }

        return list;
    }

    // 협력사 전용: 본인 발주 목록 조회
    public List<PurchaseOrderDTO> getVendorOrderList(String poNo, String poName, String status) {
        SessionUser user = getSessionUser();
        if (user == null || user.getVendorCd() == null) {
            throw new SecurityException("협력사 정보가 없습니다.");
        }

        Map<String, Object> params = new HashMap<>();
        params.put("poNo", poNo);
        params.put("poName", poName);
        params.put("status", status);
        params.put("vendorCd", user.getVendorCd()); // 본인 협력사 발주만 조회

        List<PurchaseOrderDTO> list = purchaseOrderMapper.selectVendorOrderList(params);

        // 각 PO에 대해 품목 상세 조회하여 추가
        for (PurchaseOrderDTO po : list) {
            if (po.getPoNo() != null) {
                List<PurchaseOrderItemDTO> items = purchaseOrderMapper.selectItems(po.getPoNo());
                po.setItems(items);
            }
        }

        return list;
    }

    // 상세 조회
    public PurchaseOrderDTO getDetail(String poNo) {
        PurchaseOrderDTO header = purchaseOrderMapper.selectHeader(poNo);
        if (header == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다: " + poNo);
        }

        // VENDOR인 경우: 본인 협력사 발주만 조회 가능
        SessionUser user = getSessionUser();
        if (user != null && "VENDOR".equals(user.getRole())) {
            String userVendorCd = user.getVendorCd();
            if (userVendorCd == null || !userVendorCd.equals(header.getVendorCode())) {
                throw new SecurityException("본인 협력사의 발주만 조회할 수 있습니다.");
            }
        }

        List<PurchaseOrderItemDTO> items = purchaseOrderMapper.selectItems(poNo);
        header.setItems(items);

        return header;
    }

    // 등록
    @Transactional
    public PurchaseOrderDTO create(PurchaseOrderDTO dto) {
        // ========== Validation ==========
        // 발주명 필수
        if (dto.getPoName() == null || dto.getPoName().isBlank()) {
            throw new IllegalArgumentException("발주명은 필수입니다.");
        }
        // 협력사코드 필수
        if (dto.getVendorCode() == null || dto.getVendorCode().isBlank()) {
            throw new IllegalArgumentException("협력사 정보는 필수입니다.");
        }
        // 품목 필수
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new IllegalArgumentException("발주 품목이 없습니다.");
        }
        // 품목별 Validation
        for (int i = 0; i < dto.getItems().size(); i++) {
            PurchaseOrderItemDTO item = dto.getItems().get(i);
            if (item.getOrderQuantity() == null || item.getOrderQuantity() <= 0) {
                throw new IllegalArgumentException((i + 1) + "번째 품목의 발주수량이 유효하지 않습니다.");
            }
            if (item.getUnitPrice() == null || item.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException((i + 1) + "번째 품목의 단가가 유효하지 않습니다.");
            }
        }
        // ========== End Validation ==========

        // 발주번호 생성
        String poNo = docNumService.generateDocNumStr(DocKey.PO);
        dto.setPoNo(poNo);

        // 초기 상태 강제 설정 (저장 상태)
        dto.setStatus(PoStatusCode.SAVED.getCode());

        // poDate가 null 이면 오늘 날짜로 설정
        if (dto.getPoDate() == null) {
            dto.setPoDate(LocalDate.now());
        }

        // 총액 계산
        BigDecimal totalAmount = dto.getItems().stream()
                .map(PurchaseOrderItemDTO::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);

        // 현재 사용자 ID, 부서 가져오기
        String currentUserId = getCurrentUserId();
        String currentDeptCd = getCurrentUserDeptCd();

        // 발주담당자 설정 (세션의 현재 사용자)
        dto.setPurchaseManager(currentUserId);

        // 헤더 등록 (regUserId, ctrlDeptCd 별도 전달)
        purchaseOrderMapper.insertHeader(dto, currentUserId, currentDeptCd);

        // 품목 등록
        for (PurchaseOrderItemDTO item : dto.getItems()) {
            item.setPoNo(poNo);
            purchaseOrderMapper.insertItem(item, currentUserId);
        }
        return getDetail(poNo);
    }

    // 세션에서 로그인 사용자 정보 가져오기
    private SessionUser getSessionUser() {
        Object sessionAttr = httpSession.getAttribute(SessionConst.LOGIN_USER);
        return (sessionAttr instanceof SessionUser) ? (SessionUser) sessionAttr : null;
    }

    // 현재 사용자 ID 가져오기 (세션에서)
    private String getCurrentUserId() {
        SessionUser user = getSessionUser();
        if (user == null || user.getUserId() == null) {
            throw new SecurityException("로그인 정보가 없습니다. 다시 로그인해주세요.");
        }
        return user.getUserId();
    }

    // 현재 사용자 부서 코드 가져오기 (세션에서)
    private String getCurrentUserDeptCd() {
        SessionUser user = getSessionUser();
        return user != null ? user.getDeptCd() : null;
    }

    // 수정
    @Transactional
    public PurchaseOrderDTO update(String poNo, PurchaseOrderDTO dto) {
        // 기존 발주 확인
        PurchaseOrderDTO existing = purchaseOrderMapper.selectHeader(poNo);
        if (existing == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다 : " + poNo);
        }
        // 수정 가능: T(임시저장)만
        if (!PoStatusCode.SAVED.getCode().equals(existing.getStatus())) {
            throw new IllegalStateException(
                    "임시저장 상태에서만 수정할 수 있습니다. 현재 상태: " + existing.getStatus());
        }
        dto.setPoNo(poNo);

        // 총액 재계산
        BigDecimal totalAmount = dto.getItems().stream()
                .map(PurchaseOrderItemDTO::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalAmount(totalAmount);
        // 현재 사용자 ID 가져오기
        String currentUserId = getCurrentUserId();
        // 헤더 수정
        purchaseOrderMapper.updateHeader(dto, currentUserId);
        // 기존 품목 삭제 후 재등록
        purchaseOrderMapper.deleteItems(poNo);
        for (PurchaseOrderItemDTO item : dto.getItems()) {
            item.setPoNo(poNo);
            purchaseOrderMapper.insertItem(item, currentUserId);
        }
        return getDetail(poNo);
    }

    // 삭제
    @Transactional
    public Boolean delete(String poNo) {
        PurchaseOrderDTO existing = purchaseOrderMapper.selectHeader(poNo);
        if (existing == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다: " + poNo);
        }
        // 삭제 가능: T(임시저장)만
        if (!PoStatusCode.SAVED.getCode().equals(existing.getStatus())) {
            throw new IllegalStateException(
                    "임시저장 상태에서만 삭제할 수 있습니다. 현재 상태: " + existing.getStatus());
        }

        purchaseOrderMapper.deleteHeader(poNo);
        purchaseOrderMapper.deleteItems(poNo);
        return true;
    }

    // 확정
    @Transactional
    public Boolean confirm(String poNo) {
        PurchaseOrderDTO existing = purchaseOrderMapper.selectHeader(poNo);
        if (existing == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다: " + poNo);
        }
        // 확정 가능: T(임시저장)만
        if (!PoStatusCode.SAVED.getCode().equals(existing.getStatus())) {
            throw new IllegalStateException(
                    "임시저장 상태에서만 확정할 수 있습니다. 현재 상태: " + existing.getStatus());
        }
        String currentUserId = getCurrentUserId();
        return updateStatus(poNo, PoStatusCode.CONFIRMED.getCode(), currentUserId);
    }

    // 승인
    @Transactional
    public Boolean approve(String poNo) {
        String currentUserId = getCurrentUserId();
        return updateStatus(poNo, PoStatusCode.APPROVED.getCode(), currentUserId);
    }

    // 반려 (확정 → 임시저장으로 복귀)
    @Transactional
    public Boolean reject(String poNo, String rejectReason) {
        // 반려 사유 필수 검증
        if (rejectReason == null || rejectReason.isBlank()) {
            throw new IllegalArgumentException("반려 사유는 필수입니다.");
        }
        PurchaseOrderDTO existing = purchaseOrderMapper.selectHeader(poNo);
        if (existing == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다: " + poNo);
        }
        // 확정(D) 상태에서만 반려 가능
        if (!PoStatusCode.CONFIRMED.getCode().equals(existing.getStatus())) {
            throw new IllegalStateException(
                    "확정 상태에서만 반려할 수 있습니다. 현재 상태: " + existing.getStatus());
        }
        String currentUserId = getCurrentUserId();
        // 반려 시 임시저장(T) 상태로 복귀
        purchaseOrderMapper.updateStatusWithReason(
                poNo,
                PoStatusCode.SAVED.getCode(),
                rejectReason,
                currentUserId);
        return true;
    }

    // 발주 전송
    @Transactional
    public Boolean send(String poNo) {
        String currentUserId = getCurrentUserId();
        return updateStatus(poNo, PoStatusCode.SENT.getCode(), currentUserId);
    }

    // 종결
    @Transactional
    public Boolean close(String poNo) {
        String currentUserId = getCurrentUserId();
        return updateStatus(poNo, PoStatusCode.CLOSED.getCode(), currentUserId);
    }

    // 협력사 수신확인
    @Transactional
    public Boolean vendorConfirm(String poNo) {
        PurchaseOrderDTO existing = purchaseOrderMapper.selectHeader(poNo);
        if (existing == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다: " + poNo);
        }

        // VENDOR 본인 협력사 발주만 수신확인 가능
        SessionUser user = getSessionUser();
        if (user != null && "VENDOR".equals(user.getRole())) {
            String userVendorCd = user.getVendorCd();
            if (userVendorCd == null || !userVendorCd.equals(existing.getVendorCode())) {
                throw new SecurityException("본인 협력사의 발주만 수신확인할 수 있습니다.");
            }
        }

        // 발주전송(S) 상태에서만 수신확인 가능
        if (!PoStatusCode.SENT.getCode().equals(existing.getStatus())) {
            throw new IllegalStateException(
                    "발주전송 상태에서만 수신확인할 수 있습니다. 현재 상태: " + existing.getStatus());
        }
        String currentUserId = getCurrentUserId();
        purchaseOrderMapper.updateVendorConfirm(poNo, currentUserId);
        return true;
    }

    // 상태 전이 검증 메서드
    private void validateStatusTransition(String currentStatus, String nextStatus) {
        PoStatusCode current = PoStatusCode.fromCode(currentStatus);

        if (!current.canTransitionTo(nextStatus)) {
            throw new IllegalStateException(
                    String.format("상태 전이 불가: %s → %s", currentStatus, nextStatus));
        }
    }

    // 상태 변경 공통 메서드 (검증 추가)
    private Boolean updateStatus(String poNo, String nextStatus, String userId) {
        PurchaseOrderDTO existing = purchaseOrderMapper.selectHeader(poNo);
        if (existing == null) {
            throw new NoSuchElementException("발주를 찾을 수 없습니다: " + poNo);
        }
        // 상태 전이 검증
        validateStatusTransition(existing.getStatus(), nextStatus);
        purchaseOrderMapper.updateStatus(poNo, nextStatus, userId);
        return true;
    }

    /**
     * 안전한 복호화 메서드
     * 복호화 실패 시 원본 데이터가 숫자 형식이면 원본 반환, 아니면 "0" 반환
     */
    private String decryptSafe(String value) {
        try {
            return AesCryptoUtil.decrypt(value, cryptoKey);
        } catch (Exception e) {
            // 복호화 실패 시, 원본이 숫자라면 평문으로 간주하여 반환 (테스트 데이터 호환성)
            if (value != null && value.matches("-?\\d+(\\.\\d+)?")) {
                return value;
            }
            return "0";
        }
    }

}

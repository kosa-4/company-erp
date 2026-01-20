package com.company.erp.rfq.vendor.quote.service;

import com.company.erp.rfq.vendor.quote.dto.request.VendorQuoteItemRequest;
import com.company.erp.rfq.vendor.quote.dto.request.VendorQuoteRequest;
import com.company.erp.rfq.vendor.quote.dto.response.VendorQuoteResponse;
import com.company.erp.rfq.vendor.quote.mapper.RfqVendorQuoteMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 협력사 견적서 작성 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RfqVendorQuoteService {

    private final RfqVendorQuoteMapper mapper;

    /**
     * 견적 데이터 조회 (편집용)
     */
    @Transactional
    public VendorQuoteResponse getQuoteForEdit(String rfqNum, String vendorCd) {
        // 헤더 조회
        VendorQuoteResponse response = mapper.selectQuoteHeader(rfqNum, vendorCd);
        if (response == null) {
            throw new IllegalArgumentException("해당 견적 요청을 찾을 수 없습니다.");
        }

        // 상태 검증: RFQJ 또는 RFQT 상태만 편집 가능
        String vendorStatus = response.getVendorProgressCd();
        if (!"RFQJ".equals(vendorStatus) && !"RFQT".equals(vendorStatus)) {
            throw new IllegalStateException("접수 또는 임시저장 상태의 견적만 편집할 수 있습니다. 현재 상태: " + vendorStatus);
        }

        // RFQ 전체 상태 확인 (마감/개찰/선정 완료된 경우 편집 불가)
        String rfqHdStatus = response.getProgressCd();
        if ("M".equals(rfqHdStatus) || "G".equals(rfqHdStatus) || "J".equals(rfqHdStatus)) {
            throw new IllegalStateException("이미 마감되거나 처리 완료된 견적입니다.");
        }

        // RFQVNDT 존재 여부 확인 및 초기 복사
        int vnDtCount = mapper.countRfqVndt(rfqNum, vendorCd);
        if (vnDtCount == 0) {
            // 최초 진입: RFQDT에서 RFQVNDT로 복사
            mapper.insertRfqVndtFromRfqdt(rfqNum, vendorCd, "SYSTEM");
        }

        // 품목 목록 조회
        List<VendorQuoteResponse.QuoteItemInfo> items = mapper.selectQuoteItems(rfqNum, vendorCd);
        response.setItems(items);

        return response;
    }

    /**
     * 견적 임시저장 (RFQT)
     */
    @Transactional
    public void saveQuoteDraft(String rfqNum, String vendorCd, VendorQuoteRequest request, String userId) {
        // 상태 검증
        validateQuoteEditable(rfqNum, vendorCd);

        // 품목별 금액 계산 및 업데이트
        BigDecimal totalAmt = BigDecimal.ZERO;
        for (VendorQuoteItemRequest item : request.getItems()) {
            // 금액 계산: 단가 × 수량
            BigDecimal quoteAmt = item.getQuoteUnitPrc().multiply(item.getQuoteQt());
            item.setQuoteAmt(quoteAmt);
            totalAmt = totalAmt.add(quoteAmt);

            // 품목 업데이트
            int updated = mapper.updateRfqVndtItem(rfqNum, vendorCd, item, userId);
            if (updated == 0) {
                throw new IllegalStateException("품목 업데이트에 실패했습니다. (라인번호: " + item.getLineNo() + ")");
            }
        }

        // RFQVN 상태 및 총액 업데이트 (RFQT)
        int updated = mapper.updateRfqVnStatusAndAmount(rfqNum, vendorCd, "RFQT", totalAmt, userId);
        if (updated == 0) {
            throw new IllegalStateException("견적 상태 업데이트에 실패했습니다.");
        }
    }

    /**
     * 견적 제출 (RFQC)
     */
    @Transactional
    public void submitQuote(String rfqNum, String vendorCd, VendorQuoteRequest request, String userId) {
        // 상태 검증
        validateQuoteEditable(rfqNum, vendorCd);

        // 품목별 금액 계산 및 업데이트
        BigDecimal totalAmt = BigDecimal.ZERO;
        for (VendorQuoteItemRequest item : request.getItems()) {
            // 필수 항목 검증
            if (item.getQuoteUnitPrc() == null || item.getQuoteUnitPrc().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("견적단가는 0보다 커야 합니다. (라인번호: " + item.getLineNo() + ")");
            }
            if (item.getQuoteQt() == null || item.getQuoteQt().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("견적수량은 0보다 커야 합니다. (라인번호: " + item.getLineNo() + ")");
            }

            // 금액 계산: 단가 × 수량
            BigDecimal quoteAmt = item.getQuoteUnitPrc().multiply(item.getQuoteQt());
            item.setQuoteAmt(quoteAmt);
            totalAmt = totalAmt.add(quoteAmt);

            // 품목 업데이트
            int updated = mapper.updateRfqVndtItem(rfqNum, vendorCd, item, userId);
            if (updated == 0) {
                throw new IllegalStateException("품목 업데이트에 실패했습니다. (라인번호: " + item.getLineNo() + ")");
            }
        }

        // RFQVN 상태 및 총액 업데이트 (RFQC)
        int updated = mapper.updateRfqVnStatusAndAmount(rfqNum, vendorCd, "RFQC", totalAmt, userId);
        if (updated == 0) {
            throw new IllegalStateException("견적 제출에 실패했습니다.");
        }
    }

    /**
     * 견적 편집 가능 여부 검증
     */
    private void validateQuoteEditable(String rfqNum, String vendorCd) {
        // RFQVN 상태 확인
        Map<String, Object> vnStatus = mapper.selectRfqVnStatus(rfqNum, vendorCd);
        if (vnStatus == null) {
            throw new IllegalArgumentException("해당 견적 요청을 찾을 수 없습니다.");
        }

        String currentStatus = (String) vnStatus.get("progressCd");

        // 상태 검증: RFQJ, RFQT 상태만 편집 가능
        if (!"RFQJ".equals(currentStatus) && !"RFQT".equals(currentStatus)) {
            throw new IllegalStateException("접수 또는 임시저장 상태의 견적만 편집할 수 있습니다. 현재 상태: " + currentStatus);
        }

        // RFQ 전체 상태 확인
        String rfqHdStatus = mapper.selectRfqHdStatus(rfqNum);
        if ("M".equals(rfqHdStatus) || "G".equals(rfqHdStatus) || "J".equals(rfqHdStatus)) {
            throw new IllegalStateException("이미 마감되거나 처리 완료된 견적입니다.");
        }
    }
}

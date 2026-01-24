package com.company.erp.rfq.vendor.quote.service;

import com.company.erp.common.util.AesCryptoUtil;
import com.company.erp.rfq.vendor.quote.dto.request.VendorQuoteItemRequest;
import com.company.erp.rfq.vendor.quote.dto.request.VendorQuoteRequest;
import com.company.erp.rfq.vendor.quote.dto.response.VendorQuoteResponse;
import com.company.erp.rfq.vendor.quote.mapper.RfqVendorQuoteMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.crypto.key}")
    private String cryptoKey;

    /**
     * 견적 데이터 조회 (편집/조회 공용)
     */
    @Transactional
    public VendorQuoteResponse getQuoteForEdit(String rfqNum, String vendorCd) {
        // 헤더 조회
        VendorQuoteResponse response = mapper.selectQuoteHeader(rfqNum, vendorCd);
        if (response == null) {
            throw new IllegalArgumentException("해당 견적 요청을 찾을 수 없습니다.");
        }

        String vendorStatus = response.getVendorProgressCd();
        String rfqHdStatus = response.getProgressCd();

        // RFQVNDT 존재 여부 확인 및 초기 복사
        int vnDtCount = mapper.countRfqVndt(rfqNum, vendorCd);
        if (vnDtCount == 0) {
            // "최초 복사"는 편집 가능한 기간(구매사가 전송 후 마감 전)에만 수행하도록 제한을 둡니다.
            boolean isProcessStatusReady = "RFQS".equals(vendorStatus) || "RFQJ".equals(vendorStatus);
            boolean isHdStatusReady = !"M".equals(rfqHdStatus) && !"G".equals(rfqHdStatus) && !"J".equals(rfqHdStatus);

            if (isProcessStatusReady && isHdStatusReady) {
                mapper.insertRfqVndtFromRfqdt(rfqNum, vendorCd, "SYSTEM");
            }
        }

        // 품목 목록 조회 (이미 제출된 건도 조회가 가능해야 하므로 여기서 IllegalStateException을 던지지 않습니다)
        List<VendorQuoteResponse.QuoteItemInfo> items = mapper.selectQuoteItems(rfqNum, vendorCd);

        // 본인 견적이므로 항상 복호화하여 제공
        if (items != null) {
            for (VendorQuoteResponse.QuoteItemInfo item : items) {
                if (item.getQuoteUnitPrc() != null) {
                    item.setQuoteUnitPrc(AesCryptoUtil.decrypt(item.getQuoteUnitPrc(), cryptoKey));
                }
                if (item.getQuoteAmt() != null) {
                    item.setQuoteAmt(AesCryptoUtil.decrypt(item.getQuoteAmt(), cryptoKey));
                }
            }
        }

        response.setItems(items);
        return response;
    }

    /**
     * 견적 임시저장
     */
    @Transactional
    public void saveQuoteDraft(String rfqNum, String vendorCd, VendorQuoteRequest request, String userId) {
        // 저장 시에는 반드시 편집 가능 상태인지 검증합니다.
        validateQuoteEditable(rfqNum, vendorCd);

        BigDecimal totalAmt = BigDecimal.ZERO;
        for (VendorQuoteItemRequest item : request.getItems()) {
            BigDecimal quoteAmt = item.getQuoteUnitPrc().multiply(item.getQuoteQt());
            item.setQuoteAmt(quoteAmt);
            totalAmt = totalAmt.add(quoteAmt);

            mapper.updateRfqVndtItem(
                    rfqNum,
                    vendorCd,
                    item.getLineNo(),
                    AesCryptoUtil.encrypt(item.getQuoteUnitPrc().toString(), cryptoKey),
                    item.getQuoteQt(),
                    AesCryptoUtil.encrypt(item.getQuoteAmt().toString(), cryptoKey),
                    item.getDelyDate(),
                    item.getRmk(),
                    userId);
        }

        mapper.updateRfqVnStatusAndAmount(rfqNum, vendorCd, "RFQT",
                AesCryptoUtil.encrypt(totalAmt.toString(), cryptoKey), userId);
    }

    /**
     * 견적 제출
     */
    @Transactional
    public void submitQuote(String rfqNum, String vendorCd, VendorQuoteRequest request, String userId) {
        validateQuoteEditable(rfqNum, vendorCd);

        BigDecimal totalAmt = BigDecimal.ZERO;
        for (VendorQuoteItemRequest item : request.getItems()) {
            if (item.getQuoteUnitPrc() == null || item.getQuoteUnitPrc().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("견적단가는 0보다 커야 합니다. (라인번호: " + item.getLineNo() + ")");
            }
            if (item.getQuoteQt() == null || item.getQuoteQt().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("견적수량은 0보다 커야 합니다. (라인번호: " + item.getLineNo() + ")");
            }

            BigDecimal quoteAmt = item.getQuoteUnitPrc().multiply(item.getQuoteQt());
            item.setQuoteAmt(quoteAmt);
            totalAmt = totalAmt.add(quoteAmt);

            mapper.updateRfqVndtItem(
                    rfqNum,
                    vendorCd,
                    item.getLineNo(),
                    AesCryptoUtil.encrypt(item.getQuoteUnitPrc().toString(), cryptoKey),
                    item.getQuoteQt(),
                    AesCryptoUtil.encrypt(item.getQuoteAmt().toString(), cryptoKey),
                    item.getDelyDate(),
                    item.getRmk(),
                    userId);
        }

        mapper.updateRfqVnStatusAndAmount(rfqNum, vendorCd, "RFQC",
                AesCryptoUtil.encrypt(totalAmt.toString(), cryptoKey), userId);
    }

    /**
     * 견적 편집 가능 여부 검증 (저장/제출 용)
     */
    private void validateQuoteEditable(String rfqNum, String vendorCd) {
        Map<String, Object> vnStatus = mapper.selectRfqVnStatus(rfqNum, vendorCd);
        if (vnStatus == null) {
            throw new IllegalArgumentException("해당 견적 요청을 찾을 수 없습니다.");
        }

        String currentStatus = (String) vnStatus.get("progressCd");
        // 상태 검증: 진행 중인 상태에서만 데이터 변경이 가능합니다.
        if (!"RFQJ".equals(currentStatus) && !"RFQT".equals(currentStatus)) {
            throw new IllegalStateException("데이터를 수정할 수 없는 상태입니다. (현재 상태: " + currentStatus + ")");
        }

        String rfqHdStatus = mapper.selectRfqHdStatus(rfqNum);
        if ("M".equals(rfqHdStatus) || "G".equals(rfqHdStatus) || "J".equals(rfqHdStatus)) {
            throw new IllegalStateException("마감 처리된 견적은 수정할 수 없습니다.");
        }
    }
}

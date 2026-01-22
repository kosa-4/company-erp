package com.company.erp.rfq.buyer.selection.service;

import com.company.erp.common.util.AesCryptoUtil;
import com.company.erp.rfq.buyer.selection.dto.response.RfqCompareResponse;
import com.company.erp.rfq.buyer.selection.mapper.RfqCompareMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RfqCompareService {

    private final RfqCompareMapper rfqCompareMapper;

    @Value("${app.crypto.key}")
    private String cryptoKey;

    @Transactional(readOnly = true)
    public RfqCompareResponse getCompareDetail(String rfqNo) {

        RfqCompareResponse header = rfqCompareMapper.selectHeader(rfqNo);
        if (header == null || header.getRfqNo() == null) {
            throw new IllegalArgumentException("RFQ가 존재하지 않습니다: " + rfqNo);
        }

        List<RfqCompareResponse.Item> items = rfqCompareMapper.selectItems(rfqNo);
        List<RfqCompareResponse.Vendor> vendors = rfqCompareMapper.selectVendors(rfqNo);

        // 암호문 rows
        List<RfqCompareResponse.RfqCompareQuoteRow> rows = rfqCompareMapper.selectQuoteRows(rfqNo);

        // 복호화해서 최종 quotes 만들기
        List<RfqCompareResponse.Quote> quotes = rows.stream().map(r -> {
            RfqCompareResponse.Quote q = new RfqCompareResponse.Quote();
            q.setVendorCd(r.getVendorCd());
            q.setLineNo(r.getLineNo());
            q.setQuoteQt(r.getQuoteQt());

            BigDecimal unitPrice = decryptToBigDecimal(r.getUnitPriceEnc());
            BigDecimal amount = decryptToBigDecimal(r.getAmountEnc());

            q.setUnitPrice(unitPrice);
            q.setAmount(amount);

            // amount가 비어 있으면 quoteQt * unitPrice로 계산
            if (q.getAmount() == null && unitPrice != null) {
                BigDecimal qt = (q.getQuoteQt() == null) ? BigDecimal.ZERO : q.getQuoteQt();
                q.setAmount(qt.multiply(unitPrice));
            }
            return q;
        }).toList();

        header.setItems(items);
        header.setVendors(vendors);
        header.setQuotes(quotes);

        return header;
    }

    private BigDecimal decryptToBigDecimal(String enc) {
        if (enc == null || enc.isBlank()) return null;

        // 혹시 평문 숫자 문자열로 저장된 경우도 방어
        if (enc.matches("^-?\\d+(\\.\\d+)?$")) return new BigDecimal(enc);

        String plain = AesCryptoUtil.decrypt(enc, cryptoKey); // ✅ 너희 기존 방식 그대로
        if (plain == null || plain.isBlank()) return null;

        // 복호화 결과가 "***" 같은 마스킹이면 null 처리
        if ("***".equals(plain)) return null;

        return new BigDecimal(plain);
    }
}

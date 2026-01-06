package com.company.erp.common.docNum.service;

import com.company.erp.common.docNum.dto.DocNumDTO;
import com.company.erp.common.docNum.mapper.DocNumMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class DocNumService {
    private final DocNumMapper docNumMapper;

    private static final LocalDate NO_RESET_DATE = LocalDate.of(1000, 1, 1);

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public DocNumDTO generateDocNo(DocKey key) {
        return generateDocNo(key, LocalDate.now());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public DocNumDTO generateDocNo(DocKey key, LocalDate baseDate) {

        if (key == null) throw new IllegalArgumentException("DocKey는 필수로 넣어주세요.");

        LocalDate date = (baseDate == null) ? LocalDate.now() : baseDate;

        // 1) 리셋 단위에 따라 doc_num.doc_date로 쓸 키 날짜 결정
        LocalDate keyDate = switch (key.resetUnit) {
            case DAILY -> date;
            case YEARLY -> LocalDate.of(date.getYear(), 1, 1);
            case NONE -> NO_RESET_DATE;
        };

        // 2) seq 증가
        docNumMapper.increaseSeq(key.docType, keyDate);

        // 3) 방금 증가한 seq 조회
        int seq = docNumMapper.selectCurrentSeq();

        // 4) 포맷 조합에 쓰는 dateKey 문자열
        String dateKeyStr = "";
        if (key.datePattern != null && !key.datePattern.isBlank()) {
            dateKeyStr = date.format(DateTimeFormatter.ofPattern(key.datePattern));
        }

        // 5) 최종 번호 생성
        String seqStr = String.format("%0" + key.seqPad + "d", seq);

        String docNo;
        if (key == DocKey.IT) {
            // IT-2026-000012
            docNo = key.prefix + dateKeyStr + "-" + seqStr;
        } else if (key == DocKey.VN) {
            // V001
            docNo = key.prefix + seqStr;
        } else {
            // PR2601050001 / PO2601050001 / GR2601050001
            docNo = key.docType + dateKeyStr + seqStr;
        }

        return new DocNumDTO(key.docType, docNo, seq, dateKeyStr);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generateDocNoStr(DocKey key) {
        return generateDocNo(key).getDocNo();
    }
}

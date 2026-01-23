package com.company.erp.rfq.buyer.request.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * RFQ 상세 조회 응답 DTO
 * Header, Items, Vendors 정보를 포함하며, 표시용 명칭(_NM) 필드를 제공합니다.
 */
@Getter
@Setter
public class RfqDetailResponse {

    private Header header;
    private List<Item> items;
    private List<Vendor> vendors;

    @Getter
    @Setter
    public static class Header {
        private String rfqNum; // 견적번호
        private String rfqSubject; // 견적명
        private LocalDateTime rfqDate; // 견적일자
        private String progressCd; // 진행상태코드
        private String progressNm; // 진행상태명 (T, RFQS, M, G, J)
        private String rfqType; // 견적유형 (OC: 수의계약, AC: 지명경쟁)
        private String rfqTypeNm; // 견적유형명
        private LocalDateTime reqCloseDate; // 견적마감일
        private String rmk; // 비고
        private String ctrlUserId; // 담당자ID
        private String ctrlUserNm; // 담당자명
        private String prNum; // PR번호 (Hidden)
        private String pcType; // 구매유형 (code)
        private String pcTypeNm; // 구매유형 (name)
    }

    @Getter
    @Setter
    public static class Item {
        private Integer lineNo; // 라인번호 (PR 기반 고정)
        private String itemCd; // 품목코드
        private String itemDesc; // 품목명
        private String itemSpec; // 규격
        private String unitCd; // 단위
        private BigDecimal rfqQt; // 요청수량
        private BigDecimal estUnitPrc; // 예상단가
        private BigDecimal estAmt; // 예상금액
        private LocalDate delyDate; // 희망납기일
        private String whNm; // 저장위치
        private String rmk; // 비고
    }

    @Getter
    @Setter
    public static class Vendor {
        private String vendorCd; // 협력사코드
        private String vendorNm; // 협력사명
        private String progressCd; // 진행상태코드
        private String progressNm; // 진행상태명 (RFQT -> '접수' 매핑 포함)
        private LocalDateTime sendDate; // 전송일
        private LocalDateTime submitDate; // 제출일
        private String totalAmt; // 총 견적금액 (암호화 데이터)
        private String selectYn; // 선정여부 (Y/N)
    }
}

package com.company.erp.rfq.buyer.request.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * RFQ 저장/수정 요청 DTO
 * 임시저장(T) 상태에서 사용하며, RFQHD와 RFQDT를 동기화합니다.
 * (정책에 따라 RFQVN은 send 단계에서 생성되므로 저장 시에는 선택 업체 리스트만 전달받음)
 */
@Getter
@Setter
public class RfqSaveRequest {

    private String rfqNum;
    private String prNum; // 신규 생성 시 필요
    private String pcType; // 신규 생성 시 필요

    @NotBlank(message = "견적 제목은 필수입니다.")
    private String rfqSubject;

    @NotBlank(message = "견적 유형은 필수입니다.")
    private String rfqType;

    @NotNull(message = "견적 마감일은 필수입니다.")
    private LocalDateTime reqCloseDate;

    private String rmk;

    private List<String> vendorCodes; // [추가] 저장 시 업체 목록

    @NotEmpty(message = "품목을 하나 이상 선택해야 합니다.")
    @Valid
    private List<RfqItemDTO> items;

    @Getter
    @Setter
    public static class RfqItemDTO {
        @NotNull(message = "라인번호는 필수입니다.")
        private Integer lineNo;

        @NotBlank(message = "품목코드는 필수입니다.")
        private String itemCd; // 품목코드 (모달 추가 시 필요)

        private String itemDesc; // 품목명
        private String itemSpec; // 규격
        private String unitCd; // 단위

        @NotNull(message = "요청수량은 필수입니다.")
        @DecimalMin(value = "0.001", message = "요청수량은 0보다 커야 합니다.")
        private BigDecimal rfqQt;

        private BigDecimal estUnitPrc;
        private BigDecimal estAmt; // [추가] 서비스 레이어에서 계산
        private LocalDate delyDate;
        private String whNm;
        private String rmk;
    }
}

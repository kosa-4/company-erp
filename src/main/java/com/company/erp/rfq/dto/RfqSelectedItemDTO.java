package com.company.erp.rfq.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class RfqSelectedItemDTO {
    private String rfqNo; // RFQ_NUM
    private String itemCode; // ITEM_CD
    private String itemName; // ITEM_DESC
    private String specification; // ITEM_SPEC
    private String unit; // UNIT_CD
    private BigDecimal quantity; // RFQ_QT
    private BigDecimal unitPrice; // UNIT_PRC
    private BigDecimal amount; // RFQ_AMT

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deliveryDate; // DELY_DATE

    private String storageLocation; // WH_NM
    private String remark; // RMK
}

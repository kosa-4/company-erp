package com.company.erp.rfq.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class RfqSelectedDTO {
    private String rfqNo; // RFQ_NUM
    private String rfqName; // RFQ_SUBJECT

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate rfqDate; // RFQ_DATE

    private BigDecimal rfqAmount; // RFQ_AMT
    private String purchaseType; // PC_TYPE (구매유형)
    private String vendorCode; // VENDOR_CD
    private String vendorName; // VNGL.VENDOR_NM
    private String ctrlUserId; // CTRL_USER_ID (담당자ID)
    private String ctrlUserName; // CTRL_USER_NM (담당자명)
    private String prNo; // PR_NUM (구매요청번호)
    private String remark; // RMK

    // 품목 목록
    private List<RfqSelectedItemDTO> items;
}

package com.company.erp.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.Data;

@Data
public class GrHeaderDTO {
    // 기본 정보
    private String grNo;              // 입고번호 - GR_NUM
    private String poNo;              // 발주번호 - PO_NUM
    
    // 일자 정보
    private LocalDate documentDate;   // 입고일자(문서기준) - GR_DATE
    private LocalDate postingDate;    // 입고일자(업무기준) - GR_DATE (동일 필드)
    
    // 금액 정보
    private BigDecimal totalAmount;   // 입고금액 - GR_AMT
    
    // 상태 정보 (CODD에서 조회된 코드명)
    private String status;            // 입고상태 - CODE_NAME (부분입고/입고완료/입고취소)
    
    // 기타
    private String remark;            // 비고 - RMK
    private String createdAt;        // 등록일시 - REG_DATE
    private String createdBy;         // 등록자ID - REG_USER_ID
    private String receiverId;        // 입고담당자ID - CTRL_USER_ID
    private String receiverName;      // 입고담당자명 - USER JOIN
    
    // 상세 리스트
    private List<GrDetailDTO> items;
}

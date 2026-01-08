package com.company.erp.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GrDetailDTO {
    // 기본 정보
    private String grNo;              // 입고번호 - GR_NUM
    private Integer lineNo;           // 라인번호 (계산 필드)
    private String poNo;              // 발주번호 - PO_NUM
    private Integer poLineNo;          // 발주라인번호 - PODT JOIN
    
    // 품목 정보
    private String itemCode;          // 품목코드 - ITEM_CD
    private String itemName;          // 품목명 - ITEM_DESC
    private String spec;              // 규격 - ITEM_SPEC
    private String unit;              // 단위 - UNIT_CD
    
    // 수량 정보
    private Integer orderQuantity;    // 발주수량 - PODT.PO_QT
    private Integer receivedQuantity; // 입고수량 - GR_QT (핵심 입력 필드)
    private Integer cumulativeQuantity; // 누적입고수량 (계산)
    
    // 금액 정보
    private BigDecimal unitPrice;    // 단가 - 계산: GR_AMT / GR_QT
    private BigDecimal orderAmount;   // 발주금액 - PODT.PO_AMT
    private BigDecimal receivedAmount; // 입고금액 - GR_AMT (자동계산: 단가 × 입고수량)
    
    // 협력사 정보
    private String vendorCode;        // 협력사코드 - VENDOR_CD
    private String vendorName;        // 협력사명 - VNGL JOIN
    
    // 담당자 정보
    private String receiverId;        // 입고담당자ID - CTRL_USER_ID
    private String receiverName;      // 입고담당자명 - USER JOIN
    
    // 기타
    private String storageLocation;   // 저장위치 - WH_CD
    private LocalDateTime receivedDateTime; // 입고일시 - GR_DATE
    private String status;            // 상태 - DEL_FLAG 기반 (NORMAL/CANCELED)
    private String remark;            // 비고 - RMK
}
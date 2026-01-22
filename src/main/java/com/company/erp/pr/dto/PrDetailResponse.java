package com.company.erp.pr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * PR 상세 조회 응답 DTO
 * Header와 Items 정보를 포함합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrDetailResponse {
    
    private String prNum; // 구매요청번호
    private String prSubject; // 구매요청명
    private String rmk; // 비고
    private BigDecimal prAmt; // 총 금액
    private String pcType; // 구매유형
    private String progressCd; // 진행상태
    private String deptCd; // 부서코드
    private String regUserId; // 등록자ID
    private String regDate; // 등록일자
    private String reqUserName; // 요청자명 (등록자명)
    
    private List<PrDtDTO> items; // 품목 목록
}

package com.company.erp.notice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

//공지사항 등록 요청 DTO
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoticeRequest {
    @NotBlank(message = "제목은 필수입니다.")
    private String subject;//제목
    
    @NotBlank(message = "공지내용은 필수입니다.")
    private String content;//공지내용
    
    private Date startDate;//시작일
    private Date endDate;//종료일
    private String buyerCd;//구매사코드 (선택)
    private String vendorCd;//협력사코드 (선택)
}

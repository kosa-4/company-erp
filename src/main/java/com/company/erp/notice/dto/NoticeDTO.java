package com.company.erp.notice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

//공지사항 저장/수정용 DTO
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoticeDTO {
    private String noticeNum;//공지사항번호
    private String subject;//제목
    private String content;//공지내용
    private Date regDate;//등록일
    private String regUserId;//등록자ID
    private Date modDate;//수정일
    private String modUserId;//수정자ID
    private String delFlag;//삭제여부
    private Date startDate;//시작일
    private Date endDate;//종료일
    private Integer viewCnt;//조회수
    private String buyerCd;//구매사코드
    private String vendorCd;//협력사코드
}

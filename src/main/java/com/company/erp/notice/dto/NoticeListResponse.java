package com.company.erp.notice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//공지사항 목록 조회용 DTO
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoticeListResponse {
    private String noticeNum;//공지사항번호
    private String subject;//제목
    private String regDate;//등록일 (YYYY-MM-DD 형식)
    private String regUserId;//등록자ID
    private String regUserName;//등록자명 (JOIN으로 가져옴)
    private String startDate;//시작일 (YYYY-MM-DD 형식)
    private String endDate;//종료일 (YYYY-MM-DD 형식)
    private Integer viewCnt;//조회수
}

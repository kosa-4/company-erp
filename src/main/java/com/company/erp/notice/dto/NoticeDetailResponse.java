package com.company.erp.notice.dto;

import com.company.erp.common.file.dto.FileListItemResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

//공지사항 상세 조회용 DTO
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NoticeDetailResponse {
    private String noticeNum;//공지사항번호
    private String subject;//제목
    private String content;//공지내용
    private String regDate;//등록일 (YYYY-MM-DD 형식)
    private String regUserId;//등록자ID
    private String regUserName;//등록자명 (JOIN으로 가져옴)
    private String startDate;//시작일 (YYYY-MM-DD 형식)
    private String endDate;//종료일 (YYYY-MM-DD 형식)
    private Integer viewCnt;//조회수
    private String modDate;//수정일 (YYYY-MM-DD 형식)
    private String modUserId;//수정자ID
    private List<FileListItemResponse> files;//첨부파일 목록
}

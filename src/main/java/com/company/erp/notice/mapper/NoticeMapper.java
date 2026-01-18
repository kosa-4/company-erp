package com.company.erp.notice.mapper;

import com.company.erp.notice.dto.NoticeDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NoticeMapper {
    //사용자명 조회
    String selectUserName(@Param("userId") String userId);
    
    //공지사항 등록
    void insertNotice(NoticeDTO noticeDTO);
    
    //공지사항 목록 조회
    List<com.company.erp.notice.dto.NoticeListResponse> selectNoticeList(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("subject") String subject,
            @Param("buyerCd") String buyerCd,
            @Param("vendorCd") String vendorCd
    );
    
    //공지사항 상세 조회
    com.company.erp.notice.dto.NoticeDetailResponse selectNoticeDetail(@Param("noticeNum") String noticeNum);
    
    //공지사항 수정 (제목, 내용만)
    int updateNotice(NoticeDTO noticeDTO);
    
    //공지사항 삭제 (DEL_FLAG = 'Y')
    int deleteNotice(@Param("noticeNum") String noticeNum, @Param("modUserId") String modUserId);
    
    //공지사항 조회수 증가
    int incrementViewCnt(@Param("noticeNum") String noticeNum);
}

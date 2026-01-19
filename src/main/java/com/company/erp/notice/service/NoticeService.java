package com.company.erp.notice.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.file.dto.FileListItemResponse;
import com.company.erp.common.file.service.FileService;
import com.company.erp.common.session.SessionUser;
import com.company.erp.notice.dto.NoticeDTO;
import com.company.erp.notice.dto.NoticeDetailResponse;
import com.company.erp.notice.dto.NoticeListResponse;
import com.company.erp.notice.dto.NoticeRequest;
import com.company.erp.notice.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class NoticeService {

    private final NoticeMapper noticeMapper;
    private final DocNumService docNumService;
    private final FileService fileService;
    
    private static final String REF_TYPE_NOTICE = "NOTICE";

    /**
     * 공지사항 등록 화면 초기 데이터 조회
     * @param userId 사용자 ID
     * @return 초기 데이터 (등록자명)
     */
    public Map<String, Object> initNoticeData(String userId) {
        Map<String, Object> initData = new HashMap<>();
        
        String regUserName = noticeMapper.selectUserName(userId);
        
        initData.put("regUserName", regUserName != null ? regUserName : "");
        
        return initData;
    }

    /**
     * 공지사항 등록
     * @param request 공지사항 등록 요청 데이터
     * @param sessionUser 세션 사용자 정보
     * @return 생성된 공지사항 번호
     */
    @Transactional
    public String insertNotice(NoticeRequest request, SessionUser sessionUser) {
        // 공지사항 번호 자동 생성
        String noticeNum = docNumService.generateDocNumStr(DocKey.NT);
        
        // 구매사 코드 설정 (구매사인 경우에만)
        String buyerCd = null;
        if ("B".equals(sessionUser.getComType())) {
            // 구매사 코드는 세션에서 가져오거나 별도로 조회 필요
            // 일단 null로 설정 (필요시 추가)
        }
        
        // 협력사 코드 설정 (협력사인 경우에만)
        String vendorCd = null;
        if ("V".equals(sessionUser.getComType())) {
            vendorCd = sessionUser.getVendorCd();
        }
        
        // NoticeDTO 생성
        NoticeDTO noticeDTO = NoticeDTO.builder()
                .noticeNum(noticeNum)
                .subject(request.getSubject())
                .content(request.getContent())
                .regUserId(sessionUser.getUserId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .buyerCd(buyerCd)
                .vendorCd(vendorCd)
                .build();
        
        noticeMapper.insertNotice(noticeDTO);
        
        return noticeNum;
    }

    /**
     * 공지사항 목록 조회
     */
    public List<NoticeListResponse> selectNoticeList(
            String startDate, String endDate, String subject, String buyerCd, String vendorCd) {
        return noticeMapper.selectNoticeList(startDate, endDate, subject, buyerCd, vendorCd);
    }

    /**
     * 공지사항 상세 조회 (조회수 증가 포함)
     */
    @Transactional
    public NoticeDetailResponse selectNoticeDetail(String noticeNum, SessionUser sessionUser) {
        // 조회수 증가
        noticeMapper.incrementViewCnt(noticeNum);
        
        // 상세 정보 조회
        NoticeDetailResponse detail = noticeMapper.selectNoticeDetail(noticeNum);
        
        if (detail != null) {
            // 첨부파일 목록 조회
            try {
                List<FileListItemResponse> files = fileService.list(REF_TYPE_NOTICE, noticeNum, sessionUser);
                detail.setFiles(files != null ? files : new ArrayList<>());
            } catch (Exception e) {
                // 파일 조회 실패 시 빈 리스트로 설정
                detail.setFiles(new ArrayList<>());
            }
        }
        
        return detail;
    }
    
    /**
     * 공지사항 수정 (제목, 내용만)
     * @param noticeNum 공지사항 번호
     * @param subject 제목
     * @param content 내용
     * @param sessionUser 세션 사용자 정보
     */
    @Transactional
    public void updateNotice(String noticeNum, String subject, String content, SessionUser sessionUser) {
        NoticeDTO noticeDTO = NoticeDTO.builder()
                .noticeNum(noticeNum)
                .subject(subject)
                .content(content)
                .modUserId(sessionUser.getUserId())
                .build();
        
        int updatedRows = noticeMapper.updateNotice(noticeDTO);
        
        if (updatedRows == 0) {
            throw new IllegalStateException("공지사항 수정에 실패했습니다.");
        }
    }
    
    /**
     * 공지사항 삭제
     * @param noticeNum 공지사항 번호
     * @param sessionUser 세션 사용자 정보
     */
    @Transactional
    public void deleteNotice(String noticeNum, SessionUser sessionUser) {
        int updatedRows = noticeMapper.deleteNotice(noticeNum, sessionUser.getUserId());
        
        if (updatedRows == 0) {
            throw new IllegalStateException("공지사항 삭제에 실패했습니다.");
        }
    }
}

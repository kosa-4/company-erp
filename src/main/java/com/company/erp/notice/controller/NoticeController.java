package com.company.erp.notice.controller;

import com.company.erp.common.file.dto.FileListItemResponse;
import com.company.erp.common.file.dto.FileUploadResponse;
import com.company.erp.common.file.service.FileService;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import com.company.erp.notice.dto.NoticeDetailResponse;
import com.company.erp.notice.dto.NoticeListResponse;
import com.company.erp.notice.dto.NoticeRequest;
import com.company.erp.notice.service.NoticeService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/notice")
public class NoticeController {

    private final NoticeService noticeService;
    private final FileService fileService;
    
    private static final String REF_TYPE_NOTICE = "NOTICE";

    //공지사항 초기 데이터
    @GetMapping("/init")
    public ResponseEntity<Map<String, Object>> initNotice(HttpSession session) {
        SessionUser user = getSessionUser(session);
        
        String userId = user.getUserId();
        Map<String, Object> initData = noticeService.initNoticeData(userId);
        
        return ResponseEntity.ok(initData);
    }

    //공지사항 등록
    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveNotice(
            @RequestBody @Valid NoticeRequest request,
            HttpSession session) {
        
        SessionUser user = getSessionUser(session);
        
        String noticeNum = noticeService.insertNotice(request, user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "공지사항이 등록되었습니다.");
        response.put("noticeNum", noticeNum);
        return ResponseEntity.ok(response);
    }

    //공지사항 목록 조회
    @GetMapping("/list")
    public ResponseEntity<List<NoticeListResponse>> getNoticeList(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String subject,
            HttpSession session) {
        
        try {
            SessionUser user = getSessionUser(session);
            
            // 구매사/협력사 코드 설정
            String buyerCd = null;
            String vendorCd = null;
            if ("B".equals(user.getComType())) {
                buyerCd = null; // 구매사는 전체 조회 가능
            } else if ("V".equals(user.getComType())) {

                vendorCd = null; // null로 설정하여 구매사 공지사항도 포함
            }
            
            List<NoticeListResponse> noticeList = noticeService.selectNoticeList(
                    startDate, endDate, subject, buyerCd, vendorCd);
            
            return ResponseEntity.ok(noticeList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    //공지사항 상세 조회
    @GetMapping("/{noticeNum}/detail")
    public ResponseEntity<NoticeDetailResponse> getNoticeDetail(
            @PathVariable String noticeNum,
            HttpSession session) {
        
        SessionUser user = getSessionUser(session);
        
        NoticeDetailResponse noticeDetail = noticeService.selectNoticeDetail(noticeNum, user);
        
        if (noticeDetail == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(noticeDetail);
    }
    
    /**
     * 공지사항 첨부파일 업로드
     */
    @PostMapping("/{noticeNum}/files")
    public ResponseEntity<FileUploadResponse> uploadFile(
            @PathVariable String noticeNum,
            @RequestParam("file") MultipartFile file,
            HttpSession session) {
        
        try {
            SessionUser user = getSessionUser(session);
            
            System.out.println("파일 업로드 시작 - noticeNum: " + noticeNum);
            System.out.println("파일명: " + file.getOriginalFilename());
            System.out.println("파일 크기: " + file.getSize() + " bytes");
            System.out.println("Content-Type: " + file.getContentType());
            
            // vendorCd 설정: 구매사는 null, 협력사는 세션의 vendorCd
            String vendorCd = null;
            if ("V".equals(user.getComType())) {
                vendorCd = user.getVendorCd();
            }
            
            FileUploadResponse response = fileService.upload(file, REF_TYPE_NOTICE, noticeNum, vendorCd, user);
            
            System.out.println("파일 업로드 성공 - fileNum: " + response.getFileNum());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("파일 업로드 실패 - noticeNum: " + noticeNum + ", error: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * 공지사항 첨부파일 목록 조회
     */
    @GetMapping("/{noticeNum}/files")
    public ResponseEntity<List<FileListItemResponse>> getFileList(
            @PathVariable String noticeNum,
            HttpSession session) {
        
        SessionUser user = getSessionUser(session);
        
        List<FileListItemResponse> files = fileService.list(REF_TYPE_NOTICE, noticeNum, user);
        return ResponseEntity.ok(files);
    }
    
    /**
     * 공지사항 수정 (제목, 내용만)
     * 구매사에서만 수정 가능
     */
    @PutMapping("/{noticeNum}/update")
    public ResponseEntity<Map<String, String>> updateNotice(
            @PathVariable String noticeNum,
            @RequestBody Map<String, String> request,
            HttpSession session) {
        
        SessionUser user = getSessionUser(session);
        
        // 구매사가 아닌 경우 에러 반환
        if (!"B".equals(user.getComType())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "구매사만 공지사항을 수정할 수 있습니다.");
            return ResponseEntity.status(403).body(errorResponse);
        }
        
        try {
            String subject = request.get("subject");
            String content = request.get("content");
            
            if (subject == null || subject.trim().isEmpty() || content == null || content.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "제목과 내용을 입력해주세요.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            noticeService.updateNotice(noticeNum, subject, content, user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "공지사항이 수정되었습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    //공지사항 수정
    @DeleteMapping("/{noticeNum}")
    public ResponseEntity<Map<String, String>> deleteNotice(
            @PathVariable String noticeNum,
            HttpSession session) {
        
        SessionUser user = getSessionUser(session);
        
        try {
            noticeService.deleteNotice(noticeNum, user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "공지사항이 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    //세션에서 로그인 사용자 가져옴
    private SessionUser getSessionUser(HttpSession session) {
        if (session == null) {
            return null;
        }
        Object obj = session.getAttribute(SessionConst.LOGIN_USER);
        return (obj instanceof SessionUser) ? (SessionUser) obj : null;
    }
}

package com.company.erp.common.file.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.file.dto.FileListItemResponse;
import com.company.erp.common.file.model.AttFileEntity;
import com.company.erp.common.file.service.FileService;
import com.company.erp.common.session.SessionConst;
import com.company.erp.common.session.SessionUser;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    // 파일 조회
    @GetMapping
    public ResponseEntity<List<FileListItemResponse>> list(
            @RequestParam String refType,
            @RequestParam String refNo,
            HttpSession session
    ) {
        SessionUser ses = getSessionUser(session);
        List<FileListItemResponse> list = fileService.list(refType, refNo, ses);
        return ResponseEntity.ok(list);
    }

    // 다운로드
    @GetMapping("/{fileNum}")
    public ResponseEntity<Resource> download(
            @PathVariable String fileNum,
            HttpSession session
    ) {
        SessionUser ses = getSessionUser(session);
        
        // 파일 정보 조회 (원본 파일명, Content-Type 가져오기)
        AttFileEntity fileEntity = fileService.getFileInfo(fileNum, ses);
        
        // 파일 다운로드
        Resource resource = fileService.download(fileNum, ses);

        // 원본 파일명 인코딩
        String originName = fileEntity.getOriginName();
        String encodedFilename = URLEncoder.encode(originName != null ? originName : fileNum, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        // Content-Type 설정 (없으면 APPLICATION_OCTET_STREAM)
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (fileEntity.getContentType() != null && !fileEntity.getContentType().isEmpty()) {
            try {
                mediaType = MediaType.parseMediaType(fileEntity.getContentType());
            } catch (Exception e) {
                // 파싱 실패 시 기본값 사용
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedFilename)
                .contentType(mediaType)
                .body(resource);
    }

    // 논리 삭제
    @DeleteMapping("/{fileNum}")
    public ApiResponse delete(
            @PathVariable String fileNum,
            HttpSession session
    ) {
        SessionUser ses = getSessionUser(session);
        fileService.delete(fileNum, ses);
        return ApiResponse.ok("파일이 성공적으로 삭제되었습니다.");
    }

    private SessionUser getSessionUser(HttpSession session) {
        if (session == null) return null;
        Object obj = session.getAttribute(SessionConst.LOGIN_USER);
        return (obj instanceof SessionUser) ? (SessionUser) obj : null;
    }
}

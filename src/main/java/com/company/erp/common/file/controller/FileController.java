package com.company.erp.common.file.controller;

import com.company.erp.common.exception.ApiResponse;
import com.company.erp.common.file.dto.FileListItemResponse;
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
        Resource resource = fileService.download(fileNum, ses);

        String filename = URLEncoder.encode(fileNum, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + filename)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
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

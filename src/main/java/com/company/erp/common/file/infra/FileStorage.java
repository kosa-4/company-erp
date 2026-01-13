package com.company.erp.common.file.infra;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorage {

    // 파일을 실제 저장소에 저장 ( 업로드된 파일, 상대 경로, 파일명(UUID) )
    StoredFile store(MultipartFile file, String relativeDir, String saveName) throws IOException;

    // 실제 파일 절대경로로 다운로드용 Resource 로드
    Resource loadAsResource(String absolutePath);

    // 절대경로로 실제 저장소에서 삭제 (보상 처리용)
    void delete(String absolutePath) throws IOException;
}

package com.company.erp.common.file.infra;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class StoredFile {
    // 디스크 상의 실제 절대 경로
    private final String absolutePath;
    // DB에 저장할 상대 경로 (base-dir 기준)
    private final String relativePath;
    // 실제 저장된 파일 크기 (byte)
    private final long size;
}

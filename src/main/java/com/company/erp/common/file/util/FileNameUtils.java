package com.company.erp.common.file.util;

import java.util.UUID;

public final class FileNameUtils {

    private FileNameUtils() {}

    // 확장자 추출
    public static String getExt(String filename) {
        if (filename == null) return "";
        int i = filename.lastIndexOf('.');
        return (i < 0) ? "" : filename.substring(i + 1).toLowerCase();
    }

    // 서버 저장용 파일명 생성 -> uuid.pdf
    public static String newSaveName(String ext) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return ext == null || ext.isBlank() ? uuid : uuid + "." + ext;
    }
}

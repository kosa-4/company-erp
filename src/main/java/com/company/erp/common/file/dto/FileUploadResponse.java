package com.company.erp.common.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FileUploadResponse {
    private String fileNum;
    private String originName;
    private long fileSize;
    private String contentType;
}
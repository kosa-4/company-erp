package com.company.erp.common.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class FileListItemResponse {
    private String fileNum;
    private String originName;
    private long fileSize;
    private String contentType;
    private LocalDateTime regDate;
    private String regUserId;
}

package com.company.erp.common.file.model;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AttFileEntity {

    private String fileNum;

    private String refType;
    private String refNo;

    private LocalDateTime regDate;
    private String regUserId;

    private LocalDateTime modDate;
    private String modUserId;

    private String delFlag;

    private String originName;
    private String saveName;
    private String filePath;

    private Long fileSize;
    private String contentType;

    private String vendorCd;
}

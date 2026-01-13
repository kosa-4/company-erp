package com.company.erp.common.file.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.file")
public class FileProperties {
    private String baseDir;
    private long maxSizeBytes;
    private List<String> allowedExt;
}

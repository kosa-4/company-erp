package com.company.erp.common.config;

import com.company.erp.common.file.config.FileProperties;
import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;

@Configuration
@EnableConfigurationProperties(FileProperties.class)
public class FileConfig {

    /**
     * 파일 업로드 크기 제한 설정
     * application.properties를 수정하지 않고 Java Config로 처리
     */
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        
        // 개별 파일 최대 크기: 10MB
        factory.setMaxFileSize(DataSize.ofMegabytes(10));
        
        // 전체 요청 최대 크기: 50MB (여러 파일 업로드 시)
        factory.setMaxRequestSize(DataSize.ofMegabytes(50));
        
        return factory.createMultipartConfig();
    }
}
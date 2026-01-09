package com.company.erp.common.config;

import com.company.erp.common.session.SessionInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final SessionInterceptor sessionInterceptor;

    /**
     * CORS 허용 Origin 목록
     *
     * - application.properties 에서 설정:
     *     app.cors.allowed-origins=http://localhost:3000
     *
     * - 환경변수로 override 가능:
     *     APP_CORS_ALLOWED_ORIGINS=http://localhost:3001
     *
     * - 값이 없으면 기본값(http://localhost:3000) 사용
     * - 여러 개를 허용하려면 콤마(,)로 구분
     */
    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    public WebMvcConfig(SessionInterceptor sessionInterceptor) {
        this.sessionInterceptor = sessionInterceptor;
    }

    /**
     * 인터셉터 등록
     *
     * - 모든 요청("/**")에 대해 SessionInterceptor를 적용한다.
     * - /error, /favicon.ico 는 스프링 기본 처리 경로이므로 제외한다.
     *
     * - 로그인 / 회원가입과 같이
     *   "세션 없이 접근 가능한 API"는
     *   컨트롤러 메서드에 @SessionIgnore 로 제외 처리한다.
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionInterceptor)
                .addPathPatterns("/**")          // 모든 백엔드 요청 대상
                .excludePathPatterns(
                        "/error",               // 스프링 기본 에러 페이지
                        "/favicon.ico"          // 파비콘 요청
                );
    }

    /**
     * CORS 전역 설정
     *
     * - 프론트엔드(Next.js)에서 오는 요청을 허용하기 위함
     * - 세션 기반 인증을 사용하므로 allowCredentials(true) 필수
     *
     * 주의:
     * - allowedOrigins 에 "*" 사용 불가 (쿠키 사용 시 스펙상 불가능)
     * - 반드시 정확한 Origin(host + port)을 명시해야 한다.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {

        // 콤마로 구분된 Origin 문자열을 배열로 변환
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)              // 공백 제거
                .filter(s -> !s.isEmpty())      // 빈 값 제거
                .toArray(String[]::new);

        registry.addMapping("/**")               // 모든 API 경로에 CORS 적용
                .allowedOrigins(origins)         // 허용할 프론트 Origin 목록
                .allowedMethods(
                        "GET", "POST", "PUT",
                        "PATCH", "DELETE", "OPTIONS"
                )
                .allowedHeaders("*")             // 모든 헤더 허용
                .allowCredentials(true);         // 세션 쿠키 허용
    }
}

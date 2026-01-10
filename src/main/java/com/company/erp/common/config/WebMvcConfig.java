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

    /*
     properties에서 app.cors.allowed-origins 부분
     여러 개 허용 시 콤마로 구분: http://localhost:3000,http://localhost:3001
    */
    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    public WebMvcConfig(SessionInterceptor sessionInterceptor) {
        this.sessionInterceptor = sessionInterceptor;
    }

    /*
     모든 요청(/**)에 대해 SessionInterceptor를 적용 (스프링 기본 처리 경로 제외)
     로그인, 회원가입과 같이 세션 필요 없는 모듈의 컨트롤러에서 @SessionIgnore 필수
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

    // 프론트엔드에서 오는 요청을 허용하기 위함(리액트, 뷰 등 백엔드랑 서버 다른 프론트)
    @Override
    public void addCorsMappings(CorsRegistry registry) {

        // 콤마로 구분된 Origin 문자열을 배열로 변환
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)              // 공백 제거
                .filter(s -> !s.isEmpty())      // 빈 값 제거
                .toArray(String[]::new);

        registry.addMapping("/**")     // 모든 API 경로에 CORS 적용
                .allowedOrigins(origins)         // 허용할 프론트 Origin 목록
                .allowedMethods(
                        "GET", "POST", "PUT",
                        "PATCH", "DELETE", "OPTIONS"
                )
                .allowedHeaders("*")             // 모든 헤더 허용
                .allowCredentials(true);         // 세션 쿠키 허용
    }
}

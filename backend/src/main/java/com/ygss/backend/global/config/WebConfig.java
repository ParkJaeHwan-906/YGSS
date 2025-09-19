package com.ygss.backend.global.config;

import com.ygss.backend.global.interceptor.RequestLoggingInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    private final RequestLoggingInterceptor requestLoggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(requestLoggingInterceptor)
                .addPathPatterns("/**")  // 모든 경로에 적용
                .excludePathPatterns(    // 제외할 경로들
                        "/favicon.ico",      // 파비콘
                        "/swagger-ui/**"    // 스웨거
                );
    }
}
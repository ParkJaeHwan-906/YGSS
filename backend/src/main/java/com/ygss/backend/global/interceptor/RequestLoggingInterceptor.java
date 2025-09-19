package com.ygss.backend.global.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = getClientIP(request);
        request.setAttribute("startTime", System.currentTimeMillis());

        if (queryString != null) {
            log.info("Request : [{}] {} {}?{} - IP: {}", method, uri, uri, queryString, clientIp);
        } else {
            log.info("Request : [{}] {} - IP: {}", method, uri, clientIp);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        int status = response.getStatus();

        // 처리 시간 계산
        Long startTime = (Long) request.getAttribute("startTime");
        long duration = startTime != null ? System.currentTimeMillis() - startTime : 0;

        if (ex != null) {
            log.error("Response : [{}] {} - Status: {} ({}ms) - Error: {}",
                    method, uri, status, duration, ex.getMessage());
        } else {
            log.info("Response : {} [{}] {} - Status: {} ({}ms)",
                    status, method, uri, status, duration);
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}

package com.ygss.backend.global.jwt.filter;

import java.io.IOException;
import java.util.Collections;

import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ygss.backend.global.jwt.utility.JwtTokenProvider;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
public class JWTVerificationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // 리프레시 토큰 엔드포인트는 항상 스킵
        if ("/api/auth/refresh".equals(path)) {
            return true;
        }

        // 로그인 엔드포인트 스킵
        if ("/api/auth/login".equals(path)) {
            return true;
        }

        // 회원가입 엔드포인트 스킵
        if ("/api/auth/signup".equals(path)) {
            return true;
        }

        // CORS preflight 스킵
        if (HttpMethod.OPTIONS.matches(method)) {
            return true;
        }

        // 인증이 필요없는 public 경로들
        if (path.startsWith("/api/public/")) {
            return true;
        }

        // 헬스체크 엔드포인트
        if (path.equals("/api/health")) {
            return true;
        }

        // GET 메서드 중에서 특정 엔드포인트만 스킵
        if (HttpMethod.GET.matches(method)) {
//            예시
//            if (path.equals("/api/board/list")) {
//                return true;
//            }
        }

        // 나머지는 필터 적용
        return false;
    }

    @Override
    public void doFilterInternal(HttpServletRequest request,
                                 HttpServletResponse response,
                                 FilterChain filterChain) throws ServletException, IOException {

//        log.debug("JWTVerificationFilter.doFilterInternal() called for: {}", request.getRequestURI());

        try {
            // 토큰 추출
            String token = extractToken(request);

            // 토큰이 없으면 다음 필터로 (인증되지 않은 상태로)
            if (token == null) {
//                log.debug("토큰이 없습니다. 인증되지 않은 상태로 진행합니다.");
                filterChain.doFilter(request, response);
                return;
            }

            // 토큰 검증 및 사용자 정보 추출
            if (jwtTokenProvider.validateToken(token)) {
                String userEmail = jwtTokenProvider.getUserEmail(token);

//                log.debug("유효한 토큰입니다. 사용자: {}", userEmail);

                // 간단한 인증 객체 생성 (DB 조회 없이)
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userEmail,              // principal로 이메일 사용
                                null,                   // credentials
                                Collections.emptyList() // 기본 권한 (필요시 토큰에서 추출 가능)
                        );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

//                log.debug("SecurityContext에 인증 정보가 설정되었습니다.");
            } else {
//                log.warn("유효하지 않은 JWT 토큰입니다.");
            }

            // 다음 filter로 요청을 전달
            filterChain.doFilter(request, response);

        } catch (Exception e) {
//            log.error("JWT 토큰 처리 중 오류 발생: {}", e.getMessage());
            // 예외는 SecurityExceptionHandlingFilter에서 처리하도록 전달
            throw e;
        }
    }

    /**
     * HTTP 요청 헤더에서 JWT 토큰을 추출
     * A103 접두사를 사용 (기존 프로젝트 방식 유지)
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("A103 ")) {
            return header.substring(5); // "A103 " 제거
        }

        return null;
    }
}
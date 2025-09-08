package com.ygss.backend.global.jwt.filter;

import com.ygss.backend.global.jwt.utility.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import java.io.IOException;

@RequiredArgsConstructor
/*
로그인 전담 필터
 */
@Deprecated
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;

    // TODO : JWT Filter 작성
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if(authHeader != null && authHeader.startsWith("A103 ")) {
            String token = authHeader.substring(5);

            if(tokenProvider.validateToken(token)) {
                String userEmail = tokenProvider.getUserEmail(token);
            }
        }
    }



    /**
     * 특정 경로는 JWT 검증을 스킵하도록 설정
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        // 인증이 필요없는 경로들
        return path.startsWith("/api/auth/") ||
                path.startsWith("/api/public/") ||
                path.equals("/api/health");
    }
}

package com.ygss.backend.global.jwt.filter;


import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component

/*
예외 처리 필터
일관된 json 에러 응답 제공
 */
public class SecurityExceptionHandlingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            if (e instanceof ExpiredJwtException) {
                setErrorResponse(response, HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED");
            } else if (e instanceof JwtException) {
                setErrorResponse(response, HttpStatus.UNAUTHORIZED, "TOKEN_INVALID");
            } else if (e instanceof BadCredentialsException) {
                setErrorResponse(response, HttpStatus.UNAUTHORIZED, e.getMessage());
            } else {
                setErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
            }
        }
    }

    private void setErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("status", status.value());
        errorDetails.put("message", message);

        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
    }
}
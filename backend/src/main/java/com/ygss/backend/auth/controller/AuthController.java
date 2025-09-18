package com.ygss.backend.auth.controller;

import com.ygss.backend.auth.dto.CheckEmailRequestDto;
import com.ygss.backend.auth.dto.CheckPasswordRequest;
import com.ygss.backend.auth.dto.LoginRequestDto;
import com.ygss.backend.auth.dto.SignUpRequestDto;
import com.ygss.backend.auth.service.AuthServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthServiceImpl authService;
    /**
     * 아이디 중복 확인
     */
    @PostMapping("/check/email")
    public ResponseEntity<?> checkEmail(@RequestBody CheckEmailRequestDto request) {
        try {
            return ResponseEntity.ok(authService.checkEmail(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    /**
     * 비밀번호 유효성 검사
     */
    @PostMapping("/check/password")
    public ResponseEntity<?> checkPassword(@RequestBody CheckPasswordRequest request) {
        try {
            return ResponseEntity.ok(authService.isValidPassword(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    /**
     * 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequestDto request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(authService.signUp(request));
        } catch (IllegalArgumentException e) {
            log.error("Sign Up Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (IllegalArgumentException e) {
            log.warn("Reason : {}",e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    /**
     * refreshToken 으로 AccessToken 재발급
     */
    @PutMapping("/refresh")
    public ResponseEntity<?> regenerateAccessToken(
            @AuthenticationPrincipal String email,
            @RequestHeader("Authorization") String refreshToken) {
        try {
            return ResponseEntity.ok(authService.regenerateAccessToken(email, refreshToken.substring(5)));
        } catch (Exception e) {
            log.error("Regenerate Access Token Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
}

package com.ygss.backend.auth.controller;

import com.ygss.backend.auth.dto.LoginRequestDto;
import com.ygss.backend.auth.dto.SignUpRequestDto;
import com.ygss.backend.auth.service.AuthService;
import com.ygss.backend.auth.service.AuthServiceImpl;
import com.ygss.backend.common.response.ApiResponseDto;
import com.ygss.backend.common.response.ErrorCode;
import com.ygss.backend.common.response.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthServiceImpl authService;
    /**
     * 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequestDto request) {
        try {
            authService.signUp(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(true);
        } catch (IllegalArgumentException e) {
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}

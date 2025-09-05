package com.ygss.backend.auth.controller;

import com.ygss.backend.auth.dto.LoginRequestDto;
import com.ygss.backend.auth.dto.SignUpRequestDto;
import com.ygss.backend.auth.service.AuthService;
import com.ygss.backend.auth.service.AuthServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthServiceImpl authService;
    /**
     * 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<Boolean> signUp(@RequestBody SignUpRequestDto request) {
        try {
            authService.signUp(request);
            return ResponseEntity.ok(true);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(false);
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
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}

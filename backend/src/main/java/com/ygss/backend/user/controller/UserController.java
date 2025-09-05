package com.ygss.backend.user.controller;

import com.ygss.backend.user.service.UserService;
import com.ygss.backend.user.service.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
/*
JWT 인증이 필요한 사용자 관련 API
 */
public class UserController {

    private final UserServiceImpl userService;

    /**
     * 사용자 이름 조회 (ID로)
     */
    @GetMapping("/name")
    public ResponseEntity<?> getUserNameById(@RequestParam Long id) {
        try {
            String name = userService.getUserNameById(id);
            return ResponseEntity.ok(name); // 실제 이름을 반환
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * JWT 토큰 테스트용 단순 엔드포인트
     */
    @GetMapping("/test")
    public ResponseEntity<String> testJwtAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = (String) authentication.getPrincipal();

        return ResponseEntity.ok("JWT 인증 성공! 사용자: " + userEmail);
    }
}
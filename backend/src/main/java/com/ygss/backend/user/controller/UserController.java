package com.ygss.backend.user.controller;

import com.ygss.backend.common.response.ApiResponseDto;
import com.ygss.backend.common.response.ErrorCode;
import com.ygss.backend.common.response.SuccessCode;
import com.ygss.backend.user.dto.EditUserInfoResponseDto;
import com.ygss.backend.user.dto.ValidationPasswordRequest;
import com.ygss.backend.user.service.UserService;
import com.ygss.backend.user.service.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/user")
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
    public ApiResponseDto<?> getUserNameById(@RequestParam Long id) {
        try {
            String name = userService.getUserNameById(id);
            return ApiResponseDto.success(SuccessCode.SUCCESS,name);
        } catch (IllegalArgumentException e) {
            return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        }
    }

    /**
     * JWT 토큰 테스트용 단순 엔드포인트
     */
    @GetMapping("/test")
    public ApiResponseDto<String> testJwtAuth() {
        try{
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = (String) authentication.getPrincipal();

            return ApiResponseDto.success(SuccessCode.SUCCESS,"JWT 인증 성공! 사용자: " + userEmail);
        } catch (Exception e) {
            return ApiResponseDto.fail(ErrorCode.UNAUTHORIZED);
        }

    }

    /**
     * Hwannee
     * --------------------------------------------------------------------------------------------------
     */

    /**
     * 회원정보 수정을 위한 비밀번호 검증
     */
    @PostMapping("/validation/password")
    public ResponseEntity<?> validationPassword(
            @AuthenticationPrincipal String email,
            @RequestBody ValidationPasswordRequest request) {
        try {
            return ResponseEntity.ok(userService.validationPassword(email, request.getPassword()));
        } catch (Exception e) {
            log.warn("Validation Password Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    /**
     * 비밀번호 검증을 거친 사용자 정보 불러오기
     */
    @GetMapping("/load/detail")
    public ResponseEntity<?> loadUserInfoToEdit(@AuthenticationPrincipal String email) {
        try {
            return ResponseEntity.ok(userService.getUserInfoByUserEmail(email));
        } catch (Exception e) {
            log.error("Load UserInfo To Edit Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    /**
     * 회원정보 수정
     */
    @PutMapping("/update/detail")
    public ResponseEntity<?> editUserInfo(
            @AuthenticationPrincipal String email,
            @RequestBody EditUserInfoResponseDto request) {
        try {
            if(!email.equals(request.getEmail())) throw new IllegalArgumentException("Invalid User");
            return ResponseEntity.ok(userService.updateUserInfo(request));
        } catch (Exception e) {
            log.error("Update User Info Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    /**
     * 회원 탈퇴
     * exit 의 null 값을 바꿔줌
     */
    @PatchMapping("/update/exit")
    public ResponseEntity<?> updateUserExit(@AuthenticationPrincipal String email) {
        try {
            return ResponseEntity.ok(userService.updateUserExit(email));
        } catch (Exception e) {
            log.error("Update User Exit Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
}
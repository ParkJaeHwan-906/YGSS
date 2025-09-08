package com.ygss.backend.auth.controller;

import com.ygss.backend.auth.dto.LoginRequestDto;
import com.ygss.backend.auth.dto.SignUpRequestDto;
import com.ygss.backend.auth.service.AuthService;
import com.ygss.backend.auth.service.AuthServiceImpl;
import com.ygss.backend.common.response.ApiResponseDto;
import com.ygss.backend.common.response.ErrorCode;
import com.ygss.backend.common.response.SuccessCode;
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
    public ApiResponseDto<?> signUp(@RequestBody SignUpRequestDto request) {
        try {
            authService.signUp(request);
            return ApiResponseDto.success(SuccessCode.SIGNUP_SUCCESS);
        } catch (IllegalArgumentException e) {
            return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        }
    }
    /**
     * 로그인
     */
    @PostMapping("/login")
    public ApiResponseDto<?> login(@RequestBody LoginRequestDto request) {
        try {
            return ApiResponseDto.success(SuccessCode.LOGIN_SUCCESS,authService.login(request));
        } catch (IllegalArgumentException e) {
            return ApiResponseDto.fail(ErrorCode.BAD_REQUEST);
        }
    }

}

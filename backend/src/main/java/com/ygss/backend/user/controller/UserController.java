package com.ygss.backend.user.controller;

import com.ygss.backend.common.response.ApiResponseDto;
import com.ygss.backend.common.response.ErrorCode;
import com.ygss.backend.common.response.SuccessCode;
import com.ygss.backend.user.service.UserService;
import com.ygss.backend.user.service.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

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


}
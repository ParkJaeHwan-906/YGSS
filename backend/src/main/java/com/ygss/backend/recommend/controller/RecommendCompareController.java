package com.ygss.backend.recommend.controller;

import com.ygss.backend.recommend.dto.*;
import com.ygss.backend.recommend.service.RecommendCompareServiceImpl;
import com.ygss.backend.user.dto.EditUserInfoResponseDto;
import com.ygss.backend.user.dto.UserAccountsDto;
import com.ygss.backend.user.repository.UserAccountsRepository;
import com.ygss.backend.user.service.UserServiceImpl;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/recommend")
public class RecommendCompareController {
    private final RecommendCompareServiceImpl recommendCompareService;
    private final UserServiceImpl userService;
    /**
     *  로그인하지 않은 사용자의 상품 추천 -> ??
     */
    @GetMapping("/public/compare/dc")
    public ResponseEntity<?> publicCompareRetirePensionDcProduct(RecommendCompareRequestDto request) {
        try {
            return ResponseEntity.ok(recommendCompareService.recommendCompare(null, request, true));
        } catch (Exception e) {
            log.error("Recommend Retire Pension DC Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    /**
     * 로그인 한 사용자의 상품 추천
     */
    @GetMapping("/compare/dc")
    public ResponseEntity<?> compareRetirePensionDcProduct(
            @Nullable RecommendCompareRequestDto request,
            @AuthenticationPrincipal String email) {
        try {
            return ResponseEntity.ok(recommendCompareService.recommendCompare(email, request, true));
        } catch (Exception e) {
            log.error("Recommend Retire Pension DC Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    /**
     *  로그인하지 않은 사용자의 상품 추천 -> ??
     */
    @GetMapping("/public/compare/irp")
    public ResponseEntity<?> publicCompareRetirePensionIrpProduct(RecommendCompareRequestDto request) {
        try {
            return ResponseEntity.ok(recommendCompareService.recommendCompare(null, request, false));
        } catch (Exception e) {
            log.error("Recommend Retire Pension IRP Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    /**
     * 로그인 한 사용자의 상품 추천
     */
    @GetMapping("/compare/irp")
    public ResponseEntity<?> compareRetirePensionIrpProduct(
            @Nullable RecommendCompareRequestDto request,
            @AuthenticationPrincipal String email) {
        try {
            return ResponseEntity.ok(recommendCompareService.recommendCompare(email, request, false));
        } catch (Exception e) {
            log.error("Recommend Retire Pension IRP Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    /**
     * 추천될 상품 후보 목록 조회
     */
    @GetMapping("/product/candidates")
    public ResponseEntity<?> getProductRecommendCandidates(
            @RequestParam Integer investId
    ){
        try{
            RecommendCandidateDto result = recommendCompareService.searchProductsByInvestPersonality(investId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Recommend Product Request Failed :{}",e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    /**
     *  포트폴리오 추천
     */
    @GetMapping("/product")
    public ResponseEntity<?> getRecommendDcPortfolio(@AuthenticationPrincipal String email){
        try{
            EditUserInfoResponseDto user = userService.getUserInfoByUserEmail(email);
            return ResponseEntity.ok(recommendCompareService.getRecommendPortfolio(
                    RecommendPortfolioRequest.builder()
                            .riskGradeId(user.getRiskGradeId())
                            .salary(user.getSalary())
                            .build()
            ));
        }catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}


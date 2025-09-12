package com.ygss.backend.recommend.controller;

import com.ygss.backend.recommend.dto.RecommendCandidateDto;
import com.ygss.backend.recommend.dto.RecommendCompareRequestDto;
import com.ygss.backend.recommend.service.RecommendCompareServiceImpl;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/recommend")
public class RecommendCompareController {
    private final RecommendCompareServiceImpl recommendCompareService;
    /**
     *  로그인하지 않은 사용자의 상품 추천
     */
    @GetMapping("/public/compare")
    public ResponseEntity<?> publicCompareRetirePensionProduct(RecommendCompareRequestDto request) {
        try {
            return ResponseEntity.ok(recommendCompareService.recommendCompare(null, request));
        } catch (Exception e) {
            log.error("Recommend Retire Pension Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    /**
     * 로그인 한 사용자의 상품 추천
     */
    @GetMapping("/compare")
    public ResponseEntity<?> compareRetirePensionProduct(
            @Nullable RecommendCompareRequestDto request,
            @AuthenticationPrincipal String email) {
        try {
            return ResponseEntity.ok(recommendCompareService.recommendCompare(email, request));
        } catch (Exception e) {
            log.error("Recommend Retire Pension Failed : {}", e.getMessage());
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
}


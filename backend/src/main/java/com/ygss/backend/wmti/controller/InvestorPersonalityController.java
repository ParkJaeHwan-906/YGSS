package com.ygss.backend.wmti.controller;

import com.ygss.backend.wmti.dto.InvestorPersonalityResultRequestDto;
import com.ygss.backend.wmti.dto.InvestorPersonalityResultResponseDto;
import com.ygss.backend.wmti.service.InvestorPersonalityServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/investor/personality")
public class InvestorPersonalityController {
    private final InvestorPersonalityServiceImpl investorPersonalityService;

    @GetMapping("/test")
    public ResponseEntity<?> getAllInvestorPersonalityQuestion() {
        try {
            return ResponseEntity.ok(investorPersonalityService.getInvestorPersonalityQuestion());
        } catch (Exception e) {
            log.error("Investor Personality Question Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    @PatchMapping("/result")
    public ResponseEntity<?> updateInvestorPersonalityResult(
            @RequestBody InvestorPersonalityResultRequestDto request,
            @AuthenticationPrincipal String email
            ) {
        try {
            return ResponseEntity.ok(investorPersonalityService.updateInvestorPersonalityResult(email, request));
        } catch (Exception e) {
            log.error("Update Investor Personality Result Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
}

package com.ygss.backend.pensionPlan.controller;

import com.ygss.backend.pensionPlan.dto.request.PensionPlanSearchRequest;
import com.ygss.backend.pensionPlan.service.PensionPlanServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "퇴직연금 상품", description = "퇴직연금 상품 조회 API")
@RestController
@RequestMapping("/pension/plan")
@RequiredArgsConstructor
public class PensionPlanController {

    private final PensionPlanServiceImpl pensionPlanService;

    @Operation(summary = "퇴직연금 상품 목록 조회", description = "검색 조건에 따라 퇴직연금 상품 목록을 조회합니다.")
    @GetMapping()
    public ResponseEntity<?> getAllPensionPlans(@ModelAttribute PensionPlanSearchRequest request) {
        try {
            return ResponseEntity.ok().body(pensionPlanService.searchAll(request));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @Operation(summary = "퇴직연금 상품 단건 조회", description = "ID로 특정 퇴직연금 상품 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<?> getPensionPlanById(
            @Parameter(description = "퇴직연금 상품 ID", example = "1", required = true)
            @PathVariable Long id) {
        try {
            return ResponseEntity.ok().body(pensionPlanService.searchById(id));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
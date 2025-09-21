package com.ygss.backend.recommend.dto.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPortfolioCache {

    private Long userId;
    private Long salary;
    private Long totalRetirePension;
    private Integer riskGradeId;
    private Double totalExpectedReturn;
    private String allocations;  // JSON 문자열
    private String analysisDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
package com.ygss.backend.recommend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class RecommendPortfolioRequest {
    @JsonProperty("salary")
    private Long salary;
    @JsonProperty("total_retire_pension")
    private Long totalRetirePension;
    @JsonProperty("risk_grade_id")
    private Long riskGradeId;
}

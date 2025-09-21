package com.ygss.backend.recommend.dto;
import com.ygss.backend.pensionProduct.dto.entity.PensionProduct;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendPortfolioResponse {
    private List<AllocationDto> allocations;

    @JsonProperty("total_expected_return")
    private Double totalExpectedReturn;

    @JsonProperty("total_risk_score")
    private Double totalRiskScore;

    @JsonProperty("sharpe_ratio")
    private Double sharpeRatio;

    @JsonProperty("risk_grade_id")
    private Integer riskGradeId;

    @JsonProperty("analysis_date")
    private String analysisDate;

    // 추가: 상품 정보
    private List<PensionProduct> products;
}

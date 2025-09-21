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
    // 개별 추천 상품 Top 3
    private List<AllocationDto> allocations;
    // 전체 수익률 예측값
    @JsonProperty("total_expected_return")
    private Double totalExpectedReturn;
    // 전체 위험도
    @JsonProperty("total_risk_score")
    private Double totalRiskScore;
    // 효용 극대화 비율
    @JsonProperty("sharpe_ratio")
    private Double sharpeRatio;
    // 위험도
    @JsonProperty("risk_grade_id")
    private Integer riskGradeId;
    // 분석날짜
    @JsonProperty("analysis_date")
    private String analysisDate;
}

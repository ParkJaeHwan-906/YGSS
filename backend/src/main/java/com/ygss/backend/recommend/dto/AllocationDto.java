package com.ygss.backend.recommend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationDto {
    // 상품 코드
    @JsonProperty("asset_code")
    private Long assetCode;
    // 추천 투자 비율
    @JsonProperty("allocation_percentage")
    private Double allocationPercentage;
    // 예상 수익률
    @JsonProperty("expected_return")
    private Double expectedReturn;
    // 위험도
    @JsonProperty("risk_score")
    private Double riskScore;
}
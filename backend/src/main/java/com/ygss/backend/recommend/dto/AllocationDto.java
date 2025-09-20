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

    @JsonProperty("asset_code")
    private Integer assetCode;

    @JsonProperty("allocation_percentage")
    private Double allocationPercentage;

    @JsonProperty("expected_return")
    private Double expectedReturn;

    @JsonProperty("risk_score")
    private Double riskScore;
}
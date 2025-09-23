package com.ygss.backend.recommend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProductRequestDto {
    private Long id;
    @JsonProperty("asset_type")
    private String assetType;
    @JsonProperty("risk_grade_id")
    private Long riskGradeId;
    @JsonProperty("predicted_return")
    private Double predictedReturn;
    private Long reserve;
}
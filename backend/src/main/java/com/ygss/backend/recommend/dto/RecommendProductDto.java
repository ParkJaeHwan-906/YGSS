package com.ygss.backend.recommend.dto;

import lombok.Builder;
import lombok.Data;

@Data
public class RecommendProductDto {
    private Long id;
    private String product;
    private String company;
    private String productType;
    private Double profitPrediction;
    private Long riskGradeId;
}

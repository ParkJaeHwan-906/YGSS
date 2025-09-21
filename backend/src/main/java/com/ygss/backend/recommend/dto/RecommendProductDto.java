package com.ygss.backend.recommend.dto;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class RecommendProductDto {
    private Long id;
    private String product;
    private String company;
    private Double profitPredictionRate;
}

package com.ygss.backend.product.dto;

import lombok.Data;

@Data
public class RetirePensionProductResponseDto {
    private Long id;
    private String product;
    private String company;
    private Double profitPrediction;
    private Long riskGrade;
}

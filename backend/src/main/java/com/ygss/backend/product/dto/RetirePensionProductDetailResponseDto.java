package com.ygss.backend.product.dto;

import lombok.Data;

@Data
public class RetirePensionProductDetailResponseDto {
    private Long id;
    private String productSystypeSummary;
    private String productSystype;
    private String product;
    private String company;
    private String productType;
    private Double profitPrediction;
    private Long riskGradeId;
    private String riskGrade;
}

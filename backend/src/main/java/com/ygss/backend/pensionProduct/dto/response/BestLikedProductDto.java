package com.ygss.backend.pensionProduct.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Builder
@Getter
@Setter
public class BestLikedProductDto {
    private Long id;
    private String product;
    private String company;
    private String productType;
    private Double profitPredictionRate;
    private Integer riskGrade;
}

package com.ygss.backend.product.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductInvestStrategyDto {
    private String category;
    private Double percentage;
}

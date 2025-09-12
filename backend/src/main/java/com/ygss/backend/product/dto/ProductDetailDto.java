package com.ygss.backend.product.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductDetailDto {
    private String product;
    private Double percentage;
}

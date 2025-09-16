package com.ygss.backend.product.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BondProductResponseDto {
    private Long id;
    private String productName;
    private String publisher;
    private String publisherGrade;
    private Double couponRate;
    private Integer maturityYears;
}

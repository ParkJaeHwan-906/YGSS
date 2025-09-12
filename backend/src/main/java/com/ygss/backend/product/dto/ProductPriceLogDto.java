package com.ygss.backend.product.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ProductPriceLogDto {
    private LocalDate date;
    private Integer initPrice;
    private Integer finalPrice;
    private Double dailyRate;
}

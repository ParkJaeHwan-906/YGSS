package com.ygss.backend.scheduler.fastapi.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RetirePensionProductPriceLogSimpleDto {
    private Long retirePensionProductId;
    private String product;
    private LocalDate date;
    private Integer initPrice;
    private Integer finalPrice;
    private Double dailyRate;
}

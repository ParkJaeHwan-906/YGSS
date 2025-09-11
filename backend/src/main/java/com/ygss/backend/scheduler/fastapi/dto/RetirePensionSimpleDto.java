package com.ygss.backend.scheduler.fastapi.dto;

import lombok.Data;

@Data
public class RetirePensionSimpleDto {
    private Long id;
    private String product;
    private Long reserve;               // 운용규모
    private Double expenseRatio;      // 수수료
}

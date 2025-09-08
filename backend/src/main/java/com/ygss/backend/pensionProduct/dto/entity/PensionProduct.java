package com.ygss.backend.pensionProduct.dto.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PensionProduct {
    private Long id;
    private Long companyId;
    private Long systypeId;
    private Long productTypeId;
    private String product;           // 상품명
    private Integer riskGrade;
    private Long reserve;          // 운용자산
    private Double nextYearProfitRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 조인된 정보
    private String companyName;
    private String productTypeName;
    private String systypeName;

}
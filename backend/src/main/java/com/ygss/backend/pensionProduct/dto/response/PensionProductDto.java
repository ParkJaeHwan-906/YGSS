package com.ygss.backend.pensionProduct.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 퇴직연금 상품 정보 DTO
 */
@Data
@Builder
public class PensionProductDto {

    private Long id;
    private String productName;
    private String productType;
    private String companyName;
    private String systype;
    private Integer riskGrade;
    private Long reserve;
    private Double nextYearProfitRate;
}
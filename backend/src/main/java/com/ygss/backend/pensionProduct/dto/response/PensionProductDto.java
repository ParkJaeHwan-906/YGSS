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

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public String getRiskGradeText() {
        if (riskGrade == null) return "알 수 없음";
        return switch (riskGrade) {
            case 1 -> "매우 낮음";
            case 2 -> "낮음";
            case 3 -> "보통";
            case 4 -> "높음";
            case 5 -> "매우 높음";
            default -> "알 수 없음";
        };
    }
}
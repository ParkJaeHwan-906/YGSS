package com.ygss.backend.pensionProduct.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "채권 정보")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BondDto {

    @Schema(description = "채권 상품 id", example = "1")
    private Long id;
    @Schema(description = "채권 상품명", example = "KB국민은행 제1회 무보증사채")
    private String productName;

    private Integer riskGrade;

    @Schema(description = "발행기관 신용등급", example = "AA-")
    private String publisherGrade;

    @Schema(description = "발행기관", example = "KB국민은행")
    private String publisher;

    @Schema(description = "표면금리 (%)", example = "3.25")
    private Double couponRate;

    @Schema(description = "발행금리 (%)", example = "3.15")
    private Double publishedRate;

    @Schema(description = "평가금리 (%)", example = "3.35")
    private Double evaluationRate;

    @Schema(description = "만기 연수", example = "5")
    private Integer maturityYears;

    @Schema(description = "만료일", example = "2029-12-31")
    private String expiredDay;

    @Schema(description = "최종 수익률 (%)", example = "3.42")
    private Double finalProfitRate;

    private Boolean isLiked;
}
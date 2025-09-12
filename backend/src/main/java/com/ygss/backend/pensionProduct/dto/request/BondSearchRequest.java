package com.ygss.backend.pensionProduct.dto.request;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(description = "채권 검색 조건")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BondSearchRequest {

    @Schema(description = "최소 만기 연수", example = "1")
    private Integer minMaturityYears;

    @Schema(description = "최대 만기 연수", example = "10")
    private Integer maxMaturityYears;

    @Schema(description = "최소 위험등급 (1~5, 낮을수록 안전)", example = "3")
    private Integer minRiskGrade;

    @Schema(description = "최소 신용등급 (BBB-, BBB, BBB+, A-, A, A+, AA-, AA, AA+, AAA)", example = "BBB")
    private String minPublisherGrade;

    @Schema(description = "페이지 번호 (1부터 시작)", example = "1")
    @Builder.Default
    private Integer page = 1;

    @Schema(description = "페이지 크기", example = "30")
    @Builder.Default
    private Integer size = 30;

    // 페이징을 위한 offset 계산
    public int getOffset() {
        return (page - 1) * size;
    }
}
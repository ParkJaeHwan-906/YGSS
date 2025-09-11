package com.ygss.backend.pensionPlan.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;


@Schema(description = "퇴직연금 수익률 정보")
@Data
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class PensionPlanSearchResponse {

    @Schema(description = "고유 ID", example = "1")
    private Long id;

    @Schema(description = "회사명", example = "삼성증권")
    private String companyName;

    @Schema(description = "상품유형", example = "DC(원금보장형)")
    private String systype;

    @Schema(description = "적립금 (원)", example = "14645824000000")
    private Long reserve;

    @Schema(description = "수익률 (%)", example = "4.18")
    private Double earnRate;

    @Schema(description = "3년 수익률 (%)", example = "3.41")
    private Double earnRate3;

    @Schema(description = "5년 수익률 (%)", example = "2.85")
    private Double earnRate5;

    @Schema(description = "7년 수익률 (%)", example = "2.58")
    private Double earnRate7;

    @Schema(description = "10년 수익률 (%)", example = "2.38")
    private Double earnRate10;
}

package com.ygss.backend.pensionPlan.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;


@Data
@Builder
public class PensionPlanSimpleResponse {

    @Schema(description = "고유 ID", example = "1")
    private Long id;
    @Schema(description = "회사명", example = "삼성증권")
    private String companyName;
    @Schema(description = "상품유형", example = "DC(원금보장형)")
    private String systype;
    @Schema(description = "수익률 (%)", example = "4.18")
    private Double earnRate;
}

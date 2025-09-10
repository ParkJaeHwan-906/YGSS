package com.ygss.backend.pensionPlan.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Schema(description = "퇴직연금 수익률 검색 조건")
@Data
@Builder
@RequiredArgsConstructor
@AllArgsConstructor
public class PensionPlanSearchRequest {

    @Schema(description = "회사 ID", example = "43")
    private Integer companyId;

    @Schema(description = "상품유형 ID (1: DB형, 2: DC(원금보장), 3: DC, 4: IRP)", example = "1")
    private Integer systypeId;

    @Schema(description = "회사명 (부분 검색)", example = "삼성")
    private String companyName;
}

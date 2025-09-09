package com.ygss.backend.wmti.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvestorPersonalityResultResponseDto {
    private Boolean success;
    private String investorRiskGrade;
}

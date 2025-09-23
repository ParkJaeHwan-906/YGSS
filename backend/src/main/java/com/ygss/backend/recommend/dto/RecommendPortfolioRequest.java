package com.ygss.backend.recommend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Builder
@Data
public class RecommendPortfolioRequest {
    @JsonProperty("salary")
    private Long salary;
    @JsonProperty("total_retire_pension")
    private Long totalRetirePension;
    @JsonProperty("risk_grade_id")
    private Long riskGradeId;
    @JsonProperty("asset_list")
    private List<ProductRequestDto> productList;

    public void limitFieldRange() {
        if(this.riskGradeId < 1L) this.riskGradeId = 1L;
        else if(this.riskGradeId > 5L) this.riskGradeId = 5L;
    }
}

package com.ygss.backend.recommend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecommendCompareRequestDto {
    private Long investorPersonalityId;
    private Long salary;

    public void accYear() {
        this.salary *= 12;
    }
}

package com.ygss.backend.recommend.service;

import com.ygss.backend.recommend.dto.RecommendCompareRequestDto;
import com.ygss.backend.recommend.dto.RecommendCompareResponseDto;

public interface RecommendCompareService {
    void profitPrediction();
    RecommendCompareResponseDto recommendCompare(String email, RecommendCompareRequestDto request);
    Long[] calculateOriginRetirePension(Long salary);
}

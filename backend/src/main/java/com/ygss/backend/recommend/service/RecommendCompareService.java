package com.ygss.backend.recommend.service;

import com.ygss.backend.recommend.dto.*;

public interface RecommendCompareService {
    void profitPrediction();
    RecommendCompareResponseDto recommendCompare(String email, RecommendCompareRequestDto request);
    Long[] calculatePredictionRetirePension(Long salary, Double profixRate);
    RecommendCandidateDto searchProductsByInvestPersonality(Integer InvestPersonality);
    RecommendPortfolioResponse getRecommendPortfolio(RecommendPortfolioRequest request);
}

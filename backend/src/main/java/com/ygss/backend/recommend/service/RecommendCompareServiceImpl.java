package com.ygss.backend.recommend.service;

import com.ygss.backend.recommend.dto.RecommendCompareRequestDto;
import com.ygss.backend.recommend.dto.RecommendCompareResponseDto;
import com.ygss.backend.user.repository.UserAccountsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecommendCompareServiceImpl implements RecommendCompareService {
    private final UserAccountsRepository userAccountsRepository;
    /**
     * Fast API 를 사용하여, 수익률 예측
     */
    @Override
    public void profitPrediction() {

    }

    /**
     * 상품을 비교하여 추천
     * 로그인한 회원
     *  - 투자 성향이 있는 사용자
     *  - 투자 성향이 없는 사용자
     * 로그인 하지 않은 사용자
     */
    @Override
    public RecommendCompareResponseDto recommendCompare(String email, RecommendCompareRequestDto request) {
        if(request.getInvestorPersonalityId() == null) {

        }
        return null;
    }

    /**
     * 나의 퇴직 연금 계산
     */
    @Override
    public Long calculateOriginRetirePension() {
        return 0L;
    }
}

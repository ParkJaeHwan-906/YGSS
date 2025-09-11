package com.ygss.backend.recommend.service;

import com.ygss.backend.recommend.dto.RecommendCompareRequestDto;
import com.ygss.backend.recommend.dto.RecommendCompareResponseDto;
import com.ygss.backend.recommend.dto.RecommendProductDto;
import com.ygss.backend.user.dto.UserAccountsDto;
import com.ygss.backend.user.repository.UserAccountsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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
        // 투자 성향 가져오기
        UserAccountsDto user = userAccountsRepository.selectByUserEmail(email)
                .orElse(null);
        Long investorPersonalityId = (user == null || user.getRiskGradeId() == null) ? request.getInvestorPersonalityId() : user.getRiskGradeId();
        if(investorPersonalityId == null) throw new IllegalArgumentException("Bad Request");
        Long[] originRetirePension = calculateOriginRetirePension(user == null ? request.getSalary() : user.getSalary());
        Long dbCalculate = originRetirePension[3];
        Double dbCalculateRate = 0.0;
        Long[] dbCalculateGraph = originRetirePension;
        // 파이썬 호출하여 채우기
        // dc 관련
        Long dcCalculate = 0L;
        Double dcCalculateRate = 0.0;
        Long[] dcCalculateGraph = originRetirePension;
        List<RecommendProductDto> recommendProductList = List.of();

        return RecommendCompareResponseDto.builder()
                .dbCalculate(dbCalculate)
                .dbCalculateRate(dbCalculateRate)
                .dbCalculateGraph(dbCalculateGraph)
                .dcCalculate(dcCalculate)
                .dcCalculateRate(dcCalculateRate)
                .dcCalculateGraph(dcCalculateGraph)
                .build();
    }

    /**
     * 나의 퇴직 연금 계산
     * salary : 연봉 정보
     */
    @Override
    public Long[] calculateOriginRetirePension(Long salary) {
        Long monthPay = salary/12;
        Long year3 = monthPay*3;
        Long year5 = monthPay*5;
        Long year7 = monthPay*7;
        Long year10 = monthPay*10;
        return new Long[] {year3, year5, year7, year10};
    }
}

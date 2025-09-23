package com.ygss.backend.recommend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.pensionProduct.dto.entity.PensionProduct;
import com.ygss.backend.pensionProduct.dto.request.BondSearchRequest;
import com.ygss.backend.pensionProduct.dto.request.SearchCondition;
import com.ygss.backend.pensionProduct.dto.response.BondDto;
import com.ygss.backend.pensionProduct.repository.PensionProductRepository;
import com.ygss.backend.product.repository.ProductDetailRepository;
import com.ygss.backend.product.repository.RetirePensionProductRepository;
import com.ygss.backend.recommend.dto.*;
import com.ygss.backend.recommend.repository.RecommendCacheRepository;
import com.ygss.backend.user.dto.UserAccountsDto;
import com.ygss.backend.user.repository.UserAccountsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendCompareServiceImpl implements RecommendCompareService {
    @Value("${fastapi.base.url}")
    private String fastApiBaseUrl;

    private final UserAccountsRepository userAccountsRepository;
    private final PensionProductRepository pensionProductRepository;
    private final ProductDetailRepository productDetailRepository;
    private final RestTemplate restTemplate;
    /**
     * 상품을 비교하여 추천
     * 로그인한 회원
     *  - 투자 성향이 있는 사용자
     *  - 투자 성향이 없는 사용자
     * 로그인 하지 않은 사용자
     */
    @Override
    public RecommendCompareResponseDto recommendCompare(String email, RecommendCompareRequestDto request, Boolean dc) {
        // 투자 성향 가져오기
        UserAccountsDto user = userAccountsRepository.selectByUserEmail(email)
                .orElse(null);
        Long investorPersonalityId = (user == null || user.getRiskGradeId() == null) ? request.getInvestorPersonalityId() : user.getRiskGradeId();
        if(investorPersonalityId == null) throw new IllegalArgumentException("Bad Request");
        Long userSalary = user == null ? request.getSalary() : dc ? user.getSalary() : request.getSalary();
        if(userSalary == null) throw new IllegalArgumentException("Bad Request");
        // DB
        Long[] dbCalculateGraph = calculatePredictionRetirePension(userSalary, 0.041);       // 임시로 24년도 기준 복리 적용
        Long dbCalculate = dbCalculateGraph[3];         // 최종 예상 퇴직연금
        // DC
        RecommendPortfolioResponse recommendPortfolioResponse = getRecommendPortfolio(
                RecommendPortfolioRequest.builder()
                        .riskGradeId(investorPersonalityId + (dc ? 1 : -1))     // DC 형은 조금 더 공격적인 투자, IRP 는 조금 소극적인 투자
                        .salary(userSalary)
                        .build()
        );
        Long[] dcCalculateGraph = calculatePredictionRetirePension(userSalary, recommendPortfolioResponse.getTotalExpectedReturn());
        Long dcCalculate = dcCalculateGraph[3];
        List<RecommendProductDto> recommendProductList = new ArrayList<>();
        recommendPortfolioResponse.getAllocations().forEach((product) -> {
            recommendProductList.add(pensionProductRepository.selectProductById(product.getAssetCode())
                    .orElse(null));
        });
        return RecommendCompareResponseDto.builder()
                .dbCalculate(dbCalculate)
                .dbCalculateRate(0.041)
                .dbCalculateGraph(dbCalculateGraph)
                .dcCalculate(dcCalculate)
                .dcCalculateRate(recommendPortfolioResponse.getTotalExpectedReturn())
                .dcCalculateGraph(dcCalculateGraph)
                .recommendProductList(recommendProductList)
                .build();
    }

    /**
     * 나의 퇴직 연금 계산 -> 이자율을 기반으로 계산
     * salary : 연봉 정보
     */
    @Override
    public Long[] calculatePredictionRetirePension(Long salary, Double profixRate) {
        double annualContribution = salary; // 1년 동안 납입되는 금액
        double annualRate = profixRate / 100.0;   // 연 이율 (예: 5% → 0.05)
        int[] years = {3, 5, 7, 10};

        Long[] result = new Long[years.length];

        for (int i = 0; i < years.length; i++) {
            int y = years[i];

            if (Math.abs(annualRate) < 1e-10) {
                // 이율이 0에 가까우면 그냥 원금만
                result[i] = Math.round(annualContribution * y);
            } else {
                // 복리 공식
                double total = annualContribution * (Math.pow(1 + annualRate, y) - 1) / annualRate;
                result[i] = Math.round(total);
            }
        }
        return result;
    }

    @Override
    public RecommendCandidateDto searchProductsByInvestPersonality(Integer InvestPersonality) {
        if(InvestPersonality== null || InvestPersonality<0 || InvestPersonality >5){
            throw new RuntimeException("Invalid request");
        }

        SearchCondition productCondition = SearchCondition.builder().riskGradeTo(InvestPersonality).riskGradeFrom(1).size(500).build();
        BondSearchRequest bondCondition = BondSearchRequest.builder().minRiskGrade(InvestPersonality).size(500).build();
        List<Long> systypeIds = new ArrayList<>();
        systypeIds.add(2L);
        //안정추구형?
        if(InvestPersonality>3){
            //비보장형도
            systypeIds.add(3L);
        }
        productCondition.setSystypeIds(systypeIds);
        // 상품 목록 조회
        List<PensionProduct> products = pensionProductRepository.selectSearch(productCondition);
        List<BondDto> bonds = pensionProductRepository.selectBonds(bondCondition);
        return RecommendCandidateDto.builder().products(products).bonds(bonds).build();
    }

    @Override
    public RecommendPortfolioResponse getRecommendPortfolio(RecommendPortfolioRequest request) {
        try{
            String url = fastApiBaseUrl + "/portfolio/analyze";     // 추후 /dc 추가

            request.limitFieldRange();      // riskGradeId 값 보정
            request.setProductList(productDetailRepository.selectProductForRecommend(request.getRiskGradeId()));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<RecommendPortfolioRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<RecommendPortfolioResponse> response = restTemplate.postForEntity(
                    url, entity, RecommendPortfolioResponse.class
            );
            return response.getBody();
        } catch (Exception e) {
//            throw new RuntimeException("포트폴리오 추천 중 오류 발생: " + e.getMessage(), e);
            log.error("fail : {}", e.getMessage());
            // AI 완성 전 목업 코드
            return RecommendPortfolioResponse.builder()
                    .allocations(List.of(
                            AllocationDto.builder()
                                    .assetCode(103L)
                                    .allocationPercentage(31.1)
                                    .expectedReturn(-0.36585926472562286)
                                    .riskScore(-0.37613885716265677)
                                    .build(),
                            AllocationDto.builder()
                                    .assetCode(101L)
                                    .allocationPercentage(33.75)
                                    .expectedReturn(-0.39700005171418296)
                                    .riskScore(-0.33670027807346875)
                                    .build(),
                            AllocationDto.builder()
                                    .assetCode(102L)
                                    .allocationPercentage(35.15)
                                    .expectedReturn(-0.41341633823007573)
                                    .riskScore(-0.3190644130574681)
                                    .build()
                    ))
                    .totalExpectedReturn(-1.1762756546698816)
                    .totalRiskScore(-1.0319035482935937)
                    .sharpeRatio(-3.6585926472562282)
                    .riskGradeId(1)
                    .analysisDate("2025-09-19T13:36:46.166218")
                    .build();
        }
    }
}

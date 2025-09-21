package com.ygss.backend.recommend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ygss.backend.pensionProduct.dto.entity.PensionProduct;
import com.ygss.backend.pensionProduct.dto.request.BondSearchRequest;
import com.ygss.backend.pensionProduct.dto.request.SearchCondition;
import com.ygss.backend.pensionProduct.dto.response.BondDto;
import com.ygss.backend.pensionProduct.repository.PensionProductRepository;
import com.ygss.backend.recommend.dto.*;
import com.ygss.backend.recommend.dto.entity.UserPortfolioCache;
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
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendCompareServiceImpl implements RecommendCompareService {
    private final UserAccountsRepository userAccountsRepository;
    private final PensionProductRepository pensionProductRepository;
    private final RecommendCacheRepository recommendCacheRepository;
    private final ObjectMapper objectMapper;
    @Value("${fastapi.base.url}")
    private String fastApiBaseUrl;
    private final RestTemplate restTemplate;
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
//        Long investorPersonalityId = (user == null || user.getRiskGradeId() == null) ? request.getInvestorPersonalityId() : user.getRiskGradeId();
//        if(investorPersonalityId == null) throw new IllegalArgumentException("Bad Request");
//        Long[] originRetirePension = calculateOriginRetirePension(user == null ? request.getSalary() : user.getSalary());
//        Long dbCalculate = originRetirePension[3];
//        Long[] dbCalculateGraph = originRetirePension;
//        Long dcCalculate = originRetirePension[3];
//        Long[] dcCalculateGraph = originRetirePension;
//        List<RecommendProductDto> recommendProductList = List.of();

        Long total = user.getTotalRetirePension(); //기존 누적 연금 금액
        total = (total==null)?0:total; //없으면 0

        //db-> 최고수익 상품 기준
        Double dbCalculateRate = pensionProductRepository.SelectBestBondProfit();
        Long[] dbCalculateGraph = simulate(total,dbCalculateRate,user.getSalary());
        Long dbCalculate = dbCalculateGraph[3];

        // dc 관련 -> 캐시우선, 24시간 만료 or not found -> fastAPI 호출하여 dc 수익률 받아옴
        UserPortfolioCache portfolio = recommendCacheRepository.findByUserId(user.getUserId())
                .filter(cache -> isCacheValid(cache, user))  // 캐시 유효성 검사
                .orElseGet(() -> {
                    // 캐시가 없거나 만료되면 testAPI 호출 후 캐시 저장, 현재 목업 데이터 받아오는 api
                    //TODO 정상화 후 Test가 아닌 일반 API로 변경
                    RecommendPortfolioResponse testResponse = getRecommendPortfolioTest(email);
                    return convertResponseToCache(testResponse, user);
                });
        //예측된 dc 수익율 정보
        Double dcCalculateRate = portfolio.getTotalExpectedReturn();
        Long[] dcCalculateGraph = simulate(total,dcCalculateRate,user.getSalary());
        Long dcCalculate = dcCalculateGraph[3];
        // 캐시에서 상품 정보 추출
        List<PensionProduct> recommendProductList = extractProductsFromCache(portfolio);

        return RecommendCompareResponseDto.builder()
                .dbCalculate(dbCalculate)
                .dbCalculateRate(dbCalculateRate)
                .dbCalculateGraph(dbCalculateGraph)
                .dcCalculate(dcCalculate)
                .dcCalculateRate(dcCalculateRate)
                .dcCalculateGraph(dcCalculateGraph)
                .recommendProductList(recommendProductList)
                .build();
    }

    /**
     * 기하 급수의 합을 이용한 누적 수익률 시뮬레이션 함수
     */
    Long[] simulate(Long origin, Double rate, Long salary) {
        Long[] result = new Long[4];
        Long annualContribution = salary / 12;
        double annualRate = rate / 100.0;

        int[] targetYears = {1, 3, 5, 7};

        for(int i = 0; i < 4; i++) {
            int years = targetYears[i];

            if (Math.abs(annualRate) < 1e-10) {
                // rate가 0에 가까울 때
                result[i] = (long) Math.round(origin + annualContribution * years);
            } else {
                // 기하급수 공식으로 O(1) 계산
                double r = 1 + annualRate;
                double totalAmount = origin * Math.pow(r, years) +
                        annualContribution * (Math.pow(r, years) - 1) / annualRate;
                result[i] = Math.round(totalAmount);
            }
        }

        return result;
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

    @Override
    public RecommendCandidateDto searchProductsByInvestPersonality(Integer InvestPersonality) {
        if(InvestPersonality== null || InvestPersonality<0 || InvestPersonality.intValue() >5){
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
    public RecommendPortfolioResponse getRecommendPortfolio(String email) {
        UserAccountsDto user = userAccountsRepository.selectByUserEmail(email).orElseThrow(() -> new RuntimeException("user not found"));
        try{
            RecommendPortfolioRequest request = RecommendPortfolioRequest.builder()
                    .riskGradeId(user.getRiskGradeId())
                    .salary(user.getSalary())
                    .totalRetirePension(user.getTotalRetirePension())
                    .build();

            String url = fastApiBaseUrl + "/portfolio/analyze";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<RecommendPortfolioRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<RecommendPortfolioResponse> response = restTemplate.postForEntity(
                    url, entity, RecommendPortfolioResponse.class
            );
            RecommendPortfolioResponse fastAPIResponse = response.getBody();
            if (fastAPIResponse != null && fastAPIResponse.getAllocations() != null) {
                // asset_code들을 추출해서 PensionProduct 조회
                List<Long> assetCodes = fastAPIResponse.getAllocations().stream()
                        .map(allocation -> allocation.getAssetCode().longValue())
                        .collect(Collectors.toList());

                List<PensionProduct> products = pensionProductRepository.findByIds(assetCodes);
                fastAPIResponse.setProducts(products);
                saveToCacheAsync(user,fastAPIResponse);
            }
            saveToCacheAsync(user, fastAPIResponse);
            return fastAPIResponse;
        } catch (Exception e) {
            throw new RuntimeException("포트폴리오 추천 중 오류 발생: " + e.getMessage(), e);
        }
    }

    public RecommendPortfolioResponse getRecommendPortfolioTest(String email) {
        UserAccountsDto user = userAccountsRepository.selectByUserEmail(email).orElseThrow(() -> new RuntimeException("user not found"));
        try{
            log.debug("목업 데이터 호출");
            List<AllocationDto> allocationDtos = new ArrayList<>();
            allocationDtos.add(AllocationDto.builder().assetCode(1).build());
            allocationDtos.add(AllocationDto.builder().assetCode(2).build());
            allocationDtos.add(AllocationDto.builder().assetCode(122).build());
            allocationDtos.add(AllocationDto.builder().assetCode(313).build());
            RecommendPortfolioResponse fastAPIResponse =RecommendPortfolioResponse.builder().
                    allocations(allocationDtos).
                    analysisDate("today").
                    totalExpectedReturn(4.55).
                    riskGradeId(1).
                    build();
            if (fastAPIResponse != null && fastAPIResponse.getAllocations() != null) {
                // asset_code들을 추출해서 PensionProduct 조회
                List<Long> assetCodes = fastAPIResponse.getAllocations().stream()
                        .map(allocation -> allocation.getAssetCode().longValue())
                        .collect(Collectors.toList());

                List<PensionProduct> products = pensionProductRepository.findByIds(assetCodes);
                fastAPIResponse.setProducts(products);
                saveToCacheAsync(user,fastAPIResponse);
            }
            saveToCacheAsync(user, fastAPIResponse);

            return fastAPIResponse;
        } catch (Exception e) {
            throw new RuntimeException("포트폴리오 추천 중 오류 발생: " + e.getMessage(), e);
        }
    }

    @Async
    public void saveToCacheAsync(UserAccountsDto user, RecommendPortfolioResponse response) {
        try {
            // 캐시 저장 로직

            UserPortfolioCache cache = UserPortfolioCache.builder()
                    .userId(user.getUserId())
                    .salary(user.getSalary())
                    .totalRetirePension(user.getTotalRetirePension())
                    .riskGradeId(user.getRiskGradeId().intValue())
                    .totalExpectedReturn(response.getTotalExpectedReturn())
                    .allocations(objectMapper.writeValueAsString(response.getAllocations()))
                    .analysisDate(response.getAnalysisDate())
                    .build();

            recommendCacheRepository.upsert(cache);
        } catch (Exception e) {
            log.error("캐시 저장 실패: {}", e.getMessage());
        }
    }

    // 캐시 유효성 검사 메서드 추가
    private boolean isCacheValid(UserPortfolioCache cache, UserAccountsDto user) {
        if (cache.getUpdatedAt() == null) return false;

        // 24시간 이내이고 사용자 정보가 동일한 경우
        return cache.getUpdatedAt().isAfter(LocalDateTime.now().minusHours(24)) &&
                cache.getSalary().equals(user.getSalary()) &&
                cache.getRiskGradeId().equals(user.getRiskGradeId());
    }

    // Response를 Cache로 변환하는 헬퍼 메서드
    private UserPortfolioCache convertResponseToCache(RecommendPortfolioResponse response, UserAccountsDto user) {
        try {
            return UserPortfolioCache.builder()
                    .userId(user.getUserId())
                    .salary(user.getSalary())
                    .totalRetirePension(user.getTotalRetirePension())
                    .riskGradeId(user.getRiskGradeId().intValue())
                    .totalExpectedReturn(response.getTotalExpectedReturn())
                    .allocations(objectMapper.writeValueAsString(response.getAllocations()))
                    .analysisDate(response.getAnalysisDate())
                    .build();
        } catch (Exception e) {
            log.error("Response to Cache 변환 실패: {}", e.getMessage());
            throw new RuntimeException("캐시 변환 실패", e);
        }
    }
    // 캐시에서 상품 정보 추출하는 메서드
    private List<PensionProduct> extractProductsFromCache(UserPortfolioCache cache) {
        try {
            List<AllocationDto> allocations = objectMapper.readValue(
                    cache.getAllocations(),
                    new TypeReference<List<AllocationDto>>() {}
            );

            List<Long> assetCodes = allocations.stream()
                    .map(allocation -> allocation.getAssetCode().longValue())
                    .collect(Collectors.toList());

            List<PensionProduct> products = pensionProductRepository.findByIds(assetCodes);

            return products;

        } catch (Exception e) {
            log.error("캐시에서 상품 추출 실패: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

}

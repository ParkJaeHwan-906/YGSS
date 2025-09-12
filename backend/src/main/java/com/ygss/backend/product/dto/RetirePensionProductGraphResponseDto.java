package com.ygss.backend.product.dto;

import lombok.Builder;
import lombok.Data;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Data
@Builder
public class RetirePensionProductGraphResponseDto {
    // 1. 시계열 데이터 -> 차트용
    private List<ProductPriceLogDto> priceChart;
    // 2. 상품 구성 비율
    private List<ProductInvestStrategyDto> investStrategy;
    // 3. 도넛 그래프
    private List<ProductDetailDto> doughnutChart;
    // 투자 전략, 도넛 그래프에 기타 항목 추가
    public void addEtc() {
        this.investStrategy.add(ProductInvestStrategyDto.builder()
                        .category("etc")
                        .percentage((100.0-calcProductStrategyEtcPercentage()))
                .build());

        this.doughnutChart.add(ProductDetailDto.builder()
                .product("etc")
                .percentage((100.0-calcDoughnutChartEtcPercentage()))
                .build());

    }

    private Double calcProductStrategyEtcPercentage() {
        return this.investStrategy.stream()
                .mapToDouble(ProductInvestStrategyDto::getPercentage)
                .sum();
    }
    private Double calcDoughnutChartEtcPercentage() {
        return this.doughnutChart.stream()
                .mapToDouble(ProductDetailDto::getPercentage)
                .sum();
    }

    public Map<String, Double> listToMapProductStrategy() {
        Map<String, Double> productStrategyMap = new HashMap<>();
        this.investStrategy.forEach((e) -> productStrategyMap.put(e.getCategory(), e.getPercentage()));
        return productStrategyMap;
    }

    public Map<String, Double> listToMapDoughnutChart() {
        Map<String, Double> doughnutChartMap = new HashMap<>();
        this.doughnutChart.forEach((e) -> doughnutChartMap.put(e.getProduct(), e.getPercentage()));
        return doughnutChartMap;
    }
}

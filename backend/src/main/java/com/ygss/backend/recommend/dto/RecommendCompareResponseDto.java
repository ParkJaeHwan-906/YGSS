package com.ygss.backend.recommend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RecommendCompareResponseDto {
    private Long dbCalculate;       // DB 형 예상 퇴직금
    private Long dbCalculateRate;   // DB 형 예상 수익률
    private Long[] dbCalculateGraph;// DB 형 그래프
    private Long dcCalculate;       // DC 형 예상 퇴직금
    private Long dcCalculateRate;   // DC 형 예상 수익률
    private Long[] dcCalculateGraph;// DC 형 그래프
    private List<RecommendProductDto> recommendProductList;

}

package com.ygss.backend.product.dto;

import lombok.Getter;

import java.util.*;

@Getter
public class PersonalRecommendProductResopnseDto {
    private List<RetirePensionProductResponseDto> top3;
    private List<RetirePensionProductResponseDto> productList;

    public PersonalRecommendProductResopnseDto(
            List<RetirePensionProductResponseDto> productList) {
        this.productList = productList;
        // 수익률 순으로 정렬
        productList.sort((a, b)
                -> Double.compare(b.getProfitPrediction(), a.getProfitPrediction()));
        this.top3 = new ArrayList<>();
        pickTop3Product();
    }

    private void pickTop3Product() {
        Set<String> productTypes = new HashSet<>();
        this.productList.forEach((product) -> {
            if(productTypes.add(product.getProductType())) {
                this.top3.add(product);
            }
        });
    }
}

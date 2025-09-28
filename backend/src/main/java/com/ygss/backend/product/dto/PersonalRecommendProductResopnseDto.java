package com.ygss.backend.product.dto;

import lombok.Getter;

import java.util.*;

@Getter
public class PersonalRecommendProductResopnseDto {
    private List<RetirePensionProductResponseDto> top3;
    private List<RetirePensionProductResponseDto> productList;

    public PersonalRecommendProductResopnseDto(
            List<RetirePensionProductResponseDto> productList) {
        this.top3 = new ArrayList<>();
        this.productList = new ArrayList<>();
        pickPersonalRecommendProduct(productList);
    }

    private void pickPersonalRecommendProduct(List<RetirePensionProductResponseDto> list) {
        // 수익률 순으로 정렬
        list.sort((a, b)
                -> Double.compare(b.getProfitPrediction(), a.getProfitPrediction()));

        Map<String, Integer> productTypes = new HashMap<>();
        // top3 뽑기
        Iterator<RetirePensionProductResponseDto> iterator = list.iterator();
//        while(iterator.hasNext()) {
//            RetirePensionProductResponseDto product = iterator.next();
//            if (productTypes.containsKey(product.getProductType())) continue;
//
//            productTypes.put(product.getProductType(), 0);
//            this.top3.add(product);
//            iterator.remove();
//        }
        /**
         * 시연용
         * 채권 제외하고, 나머지 상품 중 하나 채워넣기
         */
        this.top3.clear();
        while (iterator.hasNext()) {
            RetirePensionProductResponseDto product = iterator.next();
            String productType = product.getProductType();

            if ("BOND".equalsIgnoreCase(productType)) continue;

            int count = productTypes.getOrDefault(productType, 0);

            if (count < 2) {
                this.top3.add(product);
                productTypes.put(productType, count + 1);
                iterator.remove();
            }

            if (this.top3.size() > 3) break;
        }
        productTypes.put("BOND", 0);
        // 추가상품
        for(RetirePensionProductResponseDto product : list) {
            if(productTypes.get(product.getProductType()) >= 3) continue;

            productTypes.put(product.getProductType(), productTypes.get(product.getProductType()) + 1);
            this.productList.add(product);
        }
    }
}

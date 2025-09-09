package com.ygss.backend.pensionProduct.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 퇴직연금 상품 검색 응답 DTO
 */
@Data
@Builder
public class PensionProductSearchResponse {

    private List<PensionProductDto> products;
    private PageInfo pageInfo;

    public static PensionProductSearchResponse of(List<PensionProductDto> products, PageInfo pageInfo) {
        return PensionProductSearchResponse.builder()
                .products(products)
                .pageInfo(pageInfo)
                .build();
    }

    public boolean isEmpty() {
        return products == null || products.isEmpty();
    }

    public int getProductCount() {
        return products != null ? products.size() : 0;
    }
}
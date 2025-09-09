package com.ygss.backend.pensionProduct.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 채권 목록 검색 응답 DTO
 */
@Data
@Builder
public class BondSearchResponse {

    private List<BondDto> bonds;
    private PageInfo pageInfo;

    public static BondSearchResponse of(List<BondDto> bonds, PageInfo pageInfo) {
        return BondSearchResponse.builder()
                .bonds(bonds)
                .pageInfo(pageInfo)
                .build();
    }

    public boolean isEmpty() {
        return bonds == null || bonds.isEmpty();
    }

    public int getBondCount() {
        return bonds != null ? bonds.size() : 0;
    }
}
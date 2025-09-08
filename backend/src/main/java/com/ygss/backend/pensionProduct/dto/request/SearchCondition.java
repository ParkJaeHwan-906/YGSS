package com.ygss.backend.pensionProduct.dto.request;


import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * 동적 검색 조건 DTO
 */
@Data
@Builder
public class SearchCondition {

    // 검색 조건
    private List<String> productTypes; //'ETF'=>1 '펀드'=>2 '채권'=>3  'ETF,펀드,채권' => [1,2,3]
    private List<Long> companyIds;
    private Integer riskGradeFrom;
    private Integer riskGradeTo;
    private List<Long> systypeIds;

    // 페이징
    @Builder.Default
    private Integer page = 1;
    @Builder.Default
    private Integer size = 10;

    // MyBatis용 메서드
    public int getOffset() {
        return (page - 1) * size;
    }

    public int getLimit() {
        return size;
    }

    // 조건 존재 여부 확인
    public boolean hasProductTypes() {
        return productTypes != null && !productTypes.isEmpty();
    }

    public boolean hasCompanyIds() {
        return companyIds != null && !companyIds.isEmpty();
    }

    public boolean hasSystypeIds() {
        return systypeIds != null && !systypeIds.isEmpty();
    }


    public boolean hasRiskGradeRange() {
        return riskGradeFrom != null || riskGradeTo != null;
    }
}
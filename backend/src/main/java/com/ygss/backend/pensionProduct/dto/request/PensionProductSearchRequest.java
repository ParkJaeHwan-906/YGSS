package com.ygss.backend.pensionProduct.dto.request;

import lombok.Data;

import java.util.Map;

/**
 * 퇴직연금 상품 검색 요청 DTO
 */
@Data
public class PensionProductSearchRequest {

    private String productTypes;      // 쉼표로 구분된 상품타입 (ETF,펀드)
    private String principalGuarantee; // true/false
    private String companyIds;        // 쉼표로 구분된 운용사 ID (1,2,3)
    private String riskGradeFrom;     // 최소 위험등급
    private String riskGradeTo;       // 최대 위험등급
    private String systypeIds;        // 쉼표로 구분된 시스템타입 ID (0,1)
    private String page = "1";        // 페이지 번호
    private String size = "10";       // 페이지 크기

    /**
     * 요청 파라미터를 SearchCondition으로 변환
     */
    public SearchCondition toSearchCondition() {
        Map<String, String> params = Map.of(
                "productTypes", productTypes != null ? productTypes : "",
                "companyIds", companyIds != null ? companyIds : "",
                "riskGradeFrom", riskGradeFrom != null ? riskGradeFrom : "",
                "riskGradeTo", riskGradeTo != null ? riskGradeTo : "",
                "systypeIds", systypeIds != null ? systypeIds : "",
                "page", page != null ? page : "1",
                "size", size != null ? size : "10"
        );

        return SearchConditionBuilder.fromParams(params).build();
    }

    /**
     * 기본 검증
     */
    public void validate() {
        if (page != null && Integer.parseInt(page) < 1) {
            throw new IllegalArgumentException("페이지는 1 이상이어야 합니다");
        }
        if (size != null && (Integer.parseInt(size) < 1 || Integer.parseInt(size) > 50)) {
            throw new IllegalArgumentException("페이지 크기는 1-50 사이여야 합니다");
        }
    }
}

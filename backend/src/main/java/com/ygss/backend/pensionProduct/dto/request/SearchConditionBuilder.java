package com.ygss.backend.pensionProduct.dto.request;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * 동적 검색 조건 빌더
 */
public class SearchConditionBuilder {

    private final SearchCondition.SearchConditionBuilder builder;

    private SearchConditionBuilder() {
        this.builder = SearchCondition.builder();
    }

    public static SearchConditionBuilder create() {
        return new SearchConditionBuilder();
    }

    /**
     * HTTP 요청 파라미터로부터 검색 조건 생성
     */
    public static SearchConditionBuilder fromParams(Map<String, String> params) {
        SearchConditionBuilder conditionBuilder = create();

        // 상품 타입 파싱 (쉼표 구분)
        String productTypes = params.get("productTypes");
        if (productTypes != null && !productTypes.trim().isEmpty()) {
            List<String> types = Arrays.stream(productTypes.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            conditionBuilder.builder.productTypes(types);
        }


        // 운용사 ID (쉼표 구분)
        String companyIds = params.get("companyIds");
        if (companyIds != null && !companyIds.trim().isEmpty()) {
            List<Long> ids = Arrays.stream(companyIds.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .toList();
            conditionBuilder.builder.companyIds(ids);
        }

        // 위험등급 범위
        String riskGradeFrom = params.get("riskGradeFrom");
        if (riskGradeFrom != null && !riskGradeFrom.trim().isEmpty()) {
            conditionBuilder.builder.riskGradeFrom(Integer.parseInt(riskGradeFrom));
        }

        String riskGradeTo = params.get("riskGradeTo");
        if (riskGradeTo != null && !riskGradeTo.trim().isEmpty()) {
            conditionBuilder.builder.riskGradeTo(Integer.parseInt(riskGradeTo));
        }

        // 시스템 타입 ID (쉼표 구분)
        String systypeIds = params.get("systypeIds");
        if (systypeIds != null && !systypeIds.trim().isEmpty()) {
            List<Long> ids = Arrays.stream(systypeIds.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .toList();
            conditionBuilder.builder.systypeIds(ids);
        }

        // 페이징
        String page = params.get("page");
        if (page != null && !page.trim().isEmpty()) {
            conditionBuilder.builder.page(Integer.parseInt(page));
        }

        String size = params.get("size");
        if (size != null && !size.trim().isEmpty()) {
            conditionBuilder.builder.size(Integer.parseInt(size));
        }

        return conditionBuilder;
    }

    public SearchCondition build() {
        return builder.build();
    }
}
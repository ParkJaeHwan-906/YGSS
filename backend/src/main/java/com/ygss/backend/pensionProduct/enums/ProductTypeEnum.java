package com.ygss.backend.pensionProduct.enums;


import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;

/**
 * 상품 타입 Enum
 * ETF와 펀드 상품을 구분하기 위한 열거형
 */
@Getter
public enum ProductTypeEnum {

    /**
     * ETF (Exchange Traded Fund) 상품
     */
    ETF("ETF", "상장지수펀드", "Exchange Traded Fund"),

    /**
     * 펀드 (Mutual Fund) 상품
     */
    FUND("펀드", "뮤추얼펀드", "Mutual Fund");

    /**
     * 데이터베이스 저장값 (retire_pension_product_type.product_type 컬럼값)
     */
    private final String description;

    /**
     * 한글 표시명
     */
    private final String koreanName;

    /**
     * 영문 표시명
     */
    private final String englishName;

    /**
     * 생성자
     */
    ProductTypeEnum(String description, String koreanName, String englishName) {
        this.description = description;
        this.koreanName = koreanName;
        this.englishName = englishName;
    }

    /**
     * JSON 직렬화 시 사용할 값 (API 응답에서 사용)
     * @return 상품 타입 설명
     */
    @JsonValue
    public String getDescription() {
        return description;
    }

    /**
     * JSON 역직렬화 시 사용 (API 요청에서 문자열을 Enum으로 변환)
     * @param value 입력 문자열 (ETF, 펀드, FUND 등)
     * @return 해당하는 ProductTypeEnum
     * @throws IllegalArgumentException 유효하지 않은 값인 경우
     */
    @JsonCreator
    public static ProductTypeEnum fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("상품 타입 값이 null이거나 비어있습니다");
        }

        String trimmedValue = value.trim();

        return Arrays.stream(values())
                .filter(type ->
                        type.name().equalsIgnoreCase(trimmedValue) ||           // ETF, FUND
                                type.getDescription().equals(trimmedValue) ||           // ETF, 펀드
                                type.getKoreanName().equals(trimmedValue) ||            // 상장지수펀드, 뮤추얼펀드
                                type.getEnglishName().equalsIgnoreCase(trimmedValue)    // Exchange Traded Fund, Mutual Fund
                )
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 상품 타입: " + value));
    }

    /**
     * 데이터베이스 값으로 Enum 찾기
     * @param dbValue 데이터베이스 저장값
     * @return 해당하는 ProductTypeEnum
     * @throws IllegalArgumentException 유효하지 않은 값인 경우
     */
    public static ProductTypeEnum fromDatabaseValue(String dbValue) {
        return Arrays.stream(values())
                .filter(type -> type.getDescription().equals(dbValue))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("데이터베이스에서 유효하지 않은 상품 타입: " + dbValue));
    }

    /**
     * ETF인지 확인
     * @return true: ETF, false: 기타
     */
    public boolean isETF() {
        return this == ETF;
    }

    /**
     * 펀드인지 확인
     * @return true: 펀드, false: 기타
     */
    public boolean isFund() {
        return this == FUND;
    }

    /**
     * 표시용 이름 반환 (UI에서 사용)
     * @return 한글 표시명
     */
    public String getDisplayName() {
        return koreanName;
    }

    /**
     * 모든 상품 타입의 설명 반환
     * @return 설명 배열
     */
    public static String[] getAllDescriptions() {
        return Arrays.stream(values())
                .map(ProductTypeEnum::getDescription)
                .toArray(String[]::new);
    }

    /**
     * 상품 타입별 특성 설명
     * @return 상품 타입 특성 설명
     */
    public String getCharacteristics() {
        return switch (this) {
            case ETF -> "거래소에 상장되어 실시간 거래가 가능한 지수추종 상품";
            case FUND -> "전문 운용사가 관리하는 집합투자 상품";
        };
    }

    /**
     * 위험 수준 (일반적인 경우)
     * @return 위험 수준 설명
     */
    public String getGeneralRiskLevel() {
        return switch (this) {
            case ETF -> "지수 추종으로 상대적으로 안정적";
            case FUND -> "운용 방식에 따라 위험도 다양";
        };
    }
}
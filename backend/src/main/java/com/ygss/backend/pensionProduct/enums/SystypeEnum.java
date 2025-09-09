package com.ygss.backend.pensionProduct.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;

/**
 * 시스템 타입 Enum
 * 퇴직연금 시스템 타입 및 원금보장 여부를 나타내는 열거형
 */
@Getter
public enum SystypeEnum {

    /**
     * 비보장 타입 (systype_id = 0)
     */
    NON_GUARANTEE(0L, "비보장", "Non-Guarantee", false),

    /**
     * 원금보장 타입 (systype_id = 1)
     */
    GUARANTEE(1L, "원금보장", "Principal Guarantee",true);

    /**
     * 데이터베이스 ID (retire_pension_systype.id 컬럼값)
     */
    private final Long id;

    /**
     * 한글 설명
     */
    private final String description;

    /**
     * 영문 설명
     */
    private final String englishDescription;

    /**
     * 원금보장 여부
     */
    private final boolean principalGuarantee;

    /**
     * 생성자
     */
    SystypeEnum(Long id, String description, String englishDescription,
                boolean principalGuarantee) {
        this.id = id;
        this.description = description;
        this.englishDescription = englishDescription;
        this.principalGuarantee = principalGuarantee;
    }

    /**
     * JSON 직렬화 시 사용할 값
     * @return 한글 설명
     */
    @JsonValue
    public String getDescription() {
        return description;
    }

}
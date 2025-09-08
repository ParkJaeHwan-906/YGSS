package com.ygss.backend.auth.dto;

import lombok.Data;

@Data
public class SignUpRequestDto {
    /**
     * 회원가입 요청 처리를 위한 DTO
     */
    private String name;
    private String email;
    private String password;
    private Integer workedAt = 0;
    private Integer salary;
    private Integer totalRetirePension;
}

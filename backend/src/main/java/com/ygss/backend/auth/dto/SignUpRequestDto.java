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
    private Boolean newEmp = true;    // 신입 여부 ( Default = ture )
    private Long salary;
    private Long totalRetirePension;
}

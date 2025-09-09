package com.ygss.backend.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EditUserInfoResponseDto {
    private String name;
    private String email;
    private String password;
    private Integer workedAt;
    private Integer salary;
    private Integer totalRetirePension;
}

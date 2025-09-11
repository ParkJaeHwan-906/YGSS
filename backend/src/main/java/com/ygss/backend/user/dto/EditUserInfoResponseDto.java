package com.ygss.backend.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EditUserInfoResponseDto {
    private String name;
    private String email;
    private String password;
    private Boolean newEmp;
    private Long salary;
    private Long totalRetirePension;
}

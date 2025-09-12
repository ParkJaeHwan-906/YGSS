package com.ygss.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAccountsDto {
    private Long id;
    private Long userId;
    private String email;
    private String password;
    private Boolean newEmp;
    private Long salary;
    private Long totalRetirePension;
    private Long riskGradeId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

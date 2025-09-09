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
    private Integer workedAt;
    private Long salary;
    private Long totalRetirePension;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

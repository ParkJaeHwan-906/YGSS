package com.ygss.backend.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserRefreshTokenDto {
    private Long id;
    private Long user_id;
    private String refreshToken;
    private LocalDateTime createdAt;
    private LocalDateTime exit;         // 만료 기간
}

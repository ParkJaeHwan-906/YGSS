package com.ygss.backend.pensionProduct.dto.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Systype {
    private Long id;
    private String systype;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
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
public class ProductType {
    private Long id;
    private String productType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
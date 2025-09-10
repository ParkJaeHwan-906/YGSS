package com.ygss.backend.pensionProduct.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySummary {
    private String categoryName;
    private Double percentage;
}

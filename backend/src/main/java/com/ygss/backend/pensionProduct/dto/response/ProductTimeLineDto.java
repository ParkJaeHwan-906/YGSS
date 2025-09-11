package com.ygss.backend.pensionProduct.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class ProductTimeLineDto {
    private Integer price;
    private LocalDate date;
}

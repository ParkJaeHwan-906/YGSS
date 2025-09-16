package com.ygss.backend.market.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketDataResponse {
    private LocalDate date;
    private Double kospi;
    private Double oilPrice;
    private Double interestRate;
    private Double priceIndex;
    private Double cnyRate;
    private Double usdRate;
    private Double jpyRate;
}
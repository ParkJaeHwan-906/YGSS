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
    private Long kospi;
    private Long oilPrice;
    private Long interestRate;
    private Long priceIndex;
    private Long cnyRate;
    private Long usdRate;
    private Long jpyRate;
}